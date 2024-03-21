import * as fs from "node:fs";
import * as path from "node:path";

import { generateInsert } from "./generate-insert";

// jest.mock("./utils/parser");

const CWD = process.cwd();
beforeEach(() => {
	fs.mkdirSync(path.resolve(CWD, "temp"));
});

afterEach(() => {
	fs.rmSync(path.resolve(CWD, "temp"), {
		recursive: true,
		force: true,
	});
});

const SQL_INSERT_MATCHER =
	/^insert into meter_readings \(nmi, timestamp, consumption\) values \('(\w+)', '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', .+\);$/;

describe("generateInsert", () => {
	it("should generate an output file at the specified path", async () => {
		await generateInsert(
			path.resolve(CWD, "src/sample-input.csv"),
			path.resolve(CWD, "temp/output.csv"),
			path.resolve(CWD, "temp")
		);

		expect(fs.existsSync(path.resolve(CWD, "temp/output.csv"))).toBe(true);
	});

	it("should generate SQL statements without duplicates on the unique columns", async () => {
		await generateInsert(
			path.resolve(CWD, "src/sample-input.csv"),
			path.resolve(CWD, "temp/output.csv"),
			path.resolve(CWD, "temp")
		);

		const outputContent = fs.readFileSync(
			path.resolve(CWD, "temp/output.csv"),
			"utf-8"
		);
		const nmiTimestampPairs = outputContent
			.split("\n")
			.filter(Boolean)
			.map((line) => {
				const matches = SQL_INSERT_MATCHER.exec(line);
				const nmi = matches[1];
				const timestamp = matches[2];
				return `${nmi}|${timestamp}`;
			});

		/**
		 * Creating a set from (nmi, timestamp) pairs will remove duplicate pairs if there is any.
		 * We can ensure there is no duplicate value by checking the number of pairs from the
		 * output file and the set, as they should be the same.
		 */
		const nmiTimestampSet = new Set(nmiTimestampPairs);
		expect(nmiTimestampPairs.length === nmiTimestampSet.size).toBe(true);
	});
});
