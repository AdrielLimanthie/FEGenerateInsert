import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Disallowed characters only includes ':' and '|' as those are the only unsafe characters
 * present in the key. In reality there are more characters not allowed for file names in
 * different OS, but we will keep it simple for now and only include those 2.
 */
const DISALLOWED_CHARACTERS = /[:|]/g;

function sanitiseFilename(key: string) {
	return key.replace(DISALLOWED_CHARACTERS, "-");
}

/**
 * Store consumption record temporarily in a file, with the filename generated from a unique key.
 * Each consumption value is stored as a new line in the temporary file.
 *
 * @param tempPath Path to temporary directory
 * @param key Unique key to use as a file name for the temporary file
 * @param consumption Consumption value from a record
 */
export function storeRecordInTempFile(
	tempPath: string,
	key: string,
	consumption: number
) {
	const tempFilePath = path.resolve(tempPath, sanitiseFilename(key));
	fs.appendFileSync(tempFilePath, `${consumption}\n`, "utf-8");
}

/**
 * As a continuation from `storeRecordInTempFile()` function above, this function will read
 * the consumption values from a temporary file and return the sum of the consumption values.
 *
 * @param tempPath Path to temporary directory
 * @param key Unique key to use as a file name for the temporary file
 * @returns
 */
export function getTotalConsumptionFromRecord(tempPath: string, key: string) {
	const tempFilePath = path.resolve(tempPath, sanitiseFilename(key));
	if (!fs.existsSync(tempFilePath)) {
		throw new Error(`Record file '${tempFilePath}' does not exist!`);
	}

	const content = fs.readFileSync(tempFilePath, "utf-8");
	const consumptions = content.split("\n").filter(Boolean).map(Number);
	const totalConsumption = consumptions.reduce(
		(total, consumption) => total + consumption,
		0
	);

	/**
	 * Round the final number to 3 decimals, as math operations with floating point values might have unexpected result
	 */
	return Math.round(totalConsumption * 1000) / 1000;
}
