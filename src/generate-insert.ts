import fs from "node:fs";
import readline from "node:readline";

import { parseLine } from "./utils/parser";
import {
	getTotalConsumptionFromRecord,
	storeRecordInTempFile,
} from "./utils/temp-record";
import { getTimestamp } from "./utils/timestamp";

const DEFAULT_CONTEXT: { nmi: string; intervalLength: number } = {
	nmi: "",
	intervalLength: 30,
};
const KEY_SEPARATOR = "|";

/**
 * Generate SQL insert statements from consumption records in the given input file.
 * The generated SQL statements will be stored in the specified output file.
 *
 * @param inputPath Absolute path to the input file
 * @param outputPath Absolute path to the output file
 * @param tempPath Absolute path to the temporary directory
 */
export async function generateInsert(
	inputPath: string,
	outputPath: string,
	tempPath: string
) {
	const inputStream = fs.createReadStream(inputPath);
	const inputReadInterface = readline.createInterface({
		input: inputStream,
	});

	/**
	 * To store contextual information like `nmi` & `intervalLength` from "200" records,
	 * as "300" records would need this information from their parent "200" record.
	 */
	const context = { ...DEFAULT_CONTEXT };

	/**
	 * We use this to store pairs of unique (nmi, timestamp) keys when we read the input file.
	 * This is because multiple "300" records might have the same pairs of (nmi, timestamp),
	 * so we want to keep track of the unique pairs only for later.
	 */
	const uniqueKeys = new Set<string>();

	/**
	 * Read the input file line-by-line, instead of storing the entire file content in memory.
	 * This will allow reading input files with very large size and not overload the memory.
	 */
	for await (const line of inputReadInterface) {
		let parsedLine = parseLine(line);

		/**
		 * We only care about record "200" and "300" here, as the information we need belong
		 * to those 2 types of records only. Other record types are skipped.
		 */
		switch (parsedLine.code) {
			case "200": {
				const { nmi, intervalLength } = parsedLine;
				context.nmi = nmi;
				context.intervalLength = intervalLength;
				break;
			}
			case "300": {
				const { date, consumptions } = parsedLine;
				for (let index = 0; index < consumptions.length; index++) {
					const consumption = consumptions[index];
					const timestamp = getTimestamp(
						index,
						context.intervalLength,
						date
					);

					const uniqueKey = `${context.nmi}${KEY_SEPARATOR}${timestamp}`;
					uniqueKeys.add(uniqueKey);

					/**
					 * The table `meter_readings` has a constraint to have unique (nmi, timestamp),
					 * so we can't directly convert each "300" record into sql insert statement as
					 * there might be other "300" records with same (nmi, timestamp) key.
					 *
					 * Instead, we are storing each consumption record in a temporary file for now.
					 * We don't want to store the record in memory for the same reason as reading
					 * the input file line-by-line, the input size might be larger than the size of
					 * available memory.
					 */
					storeRecordInTempFile(tempPath, uniqueKey, consumption);
				}

				break;
			}
		}
	}

	/**
	 * Go through each unique key, which corresponds to a temporary record file that we stored previously
	 */
	for (let key of uniqueKeys) {
		/**
		 * I am assuming that each record with the same (nmi, timestamp) key belong to 2 different meters
		 * in the same place. In this case, it makes sense to sum the consumption values and use
		 * the total consumption value for the insert statement.
		 *
		 * The function here will do that by reading the temporary files we generated previously,
		 * and then summing all the consumption values listed there.
		 */
		const totalConsumption = getTotalConsumptionFromRecord(tempPath, key);
		const [nmi, timestamp] = key.split(KEY_SEPARATOR);

		/**
		 * Finally, we store the insert statement for each unique (nmi, timestamp) into the output file
		 */
		const sql = `insert into meter_readings (nmi, timestamp, consumption) values ('${nmi}', '${timestamp}', ${totalConsumption});\n`;
		fs.appendFileSync(outputPath, sql, "utf-8");
	}
}
