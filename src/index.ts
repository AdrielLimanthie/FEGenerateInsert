import fs from "node:fs";
import path from "node:path";
import { generateInsert } from "./generate-insert";

async function main() {
	// Get the absolute path to input & output file
	let [inputPath, outputPath = "output.sql"] = process.argv.slice(2);
	if (!inputPath) {
		throw new Error("Input file is not specified!");
	}
	inputPath = path.resolve(process.cwd(), inputPath);
	outputPath = path.resolve(process.cwd(), outputPath);

	// Validation for the input file
	if (!fs.existsSync(inputPath)) {
		throw new Error("Input file does not exist!");
	}

	// Rewrite if the output file already exists
	if (fs.existsSync(outputPath)) {
		fs.writeFileSync(outputPath, "", "utf-8");
	}

	// Create temporary folder to store records while we process the input file
	let tempPath = path.resolve(process.cwd(), "temp");
	if (!fs.existsSync(tempPath)) {
		fs.mkdirSync(tempPath);
	}

	// Process the input file and generate the output
	await generateInsert(inputPath, outputPath, tempPath);

	// Remove the temporary folder
	fs.rmSync(tempPath, { recursive: true, force: true });
}

main();
