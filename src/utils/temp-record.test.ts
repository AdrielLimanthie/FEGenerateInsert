import * as fs from "node:fs";
import * as path from "node:path";

import {
	getTotalConsumptionFromRecord,
	storeRecordInTempFile,
} from "./temp-record";

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

describe("storeRecordInTempFile()", () => {
	const key = "NEM1201009|2024-02-02 00:00:00";
	const tempPath = `${CWD}\\temp`;
	const filePath = `${tempPath}\\NEM1201009-2024-02-02 00-00-00`;

	it("should create a temporary file with safe-to-use characters", () => {
		storeRecordInTempFile(tempPath, key, 1);
		expect(fs.existsSync(filePath)).toBe(true);
	});

	it("should create a new temporary file if it didn't exist", () => {
		storeRecordInTempFile(tempPath, key, 1);
		expect(fs.readFileSync(filePath, "utf-8")).toBe("1\n");
	});

	it("should append the consumption value to an existing file", () => {
		fs.writeFileSync(filePath, "1.5\n", "utf-8");
		storeRecordInTempFile(tempPath, key, 1);
		expect(fs.readFileSync(filePath, "utf-8")).toBe("1.5\n1\n");
	});
});

describe("getTotalConsumptionFromRecord()", () => {
	const key = "NEM1201009|2024-02-02 00:00:00";
	const tempPath = `${CWD}\\temp`;
	const filePath = `${tempPath}\\NEM1201009-2024-02-02 00-00-00`;

	it("should throw an error if the file doesn't exist", () => {
		expect(() => getTotalConsumptionFromRecord(filePath, key)).toThrow();
	});

	it("should return the sum of all consumption values", () => {
		fs.writeFileSync(filePath, "1\n1.5\n");
		const totalConsumption = getTotalConsumptionFromRecord(tempPath, key);
		expect(totalConsumption).toBe(2.5);
	});

	it("should return the total sum rounded with max 3 decimals", () => {
		fs.writeFileSync(filePath, "1.507\n1.750\n");
		const totalConsumption = getTotalConsumptionFromRecord(tempPath, key);
		expect(totalConsumption).toBe(3.257);
	});
});
