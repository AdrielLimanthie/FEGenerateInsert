type ParsedLine =
	| { code: "100" }
	| { code: "200"; nmi: string; intervalLength: number }
	| { code: "300"; date: Date; consumptions: number[] }
	| { code: "500" }
	| { code: "900" };

const MINUTES_IN_A_DAY = 60 * 24;

/**
 * Parse a line from the input file and convert them to the corresponding data structure.
 * For record "200" & "300", the function will include the data associated with the record,
 * (e.g. `nmi` & `intervalLength` for record "200").
 *
 * For other record types beside "200" & "300", only the record type will be returned.
 *
 * @param line A line from input file
 * @param interval Interval length, only necessary for "300" record to let the function know how many consumption values are in the record
 * @returns A data structure containing information corresponding to the record type
 */
export function parseLine(line: string, interval: number = 30): ParsedLine {
	const parts = line.split(",");
	const code = parts[0] as "100" | "200" | "300" | "500" | "900";
	let nmi = "",
		intervalLength = 0,
		date = new Date(),
		consumptions: number[] = [];

	if (code === "200") {
		nmi = parts[1];
		intervalLength = Number(parts[8]);
	} else if (code === "300") {
		date = parseDate(parts[1]);

		/**
		 * Consumption values might not always be from column 3-50, rather it depends on the interval.
		 * In the sample input, the interval is always 30 mins.
		 * This means in 1 day there are 48 entries (60 mins * 24 hours / 30 mins interval), so column 3-50 makes sense.
		 * But according to the specification, inteval can be 5, 15 or 30 mins.
		 * With shorter interval, there will be more entries in a row.
		 * The code below will extract consumption values dynamically based on the given interval.
		 */
		consumptions = parts
			.slice(2, MINUTES_IN_A_DAY / interval + 2)
			.map(Number);
	}

	switch (code) {
		case "200":
			return { code, nmi, intervalLength };
		case "300":
			return { code, date, consumptions };
		default:
			return { code };
	}
}

/**
 * Convert date string from input file to JS Date object.
 *
 * @param rawDate String representation of date, from input file
 * @returns JS Date object
 */
function parseDate(rawDate: string): Date {
	const year = Number(rawDate.substring(0, 4));
	const month = Number(rawDate.substring(4, 6));
	const date = Number(rawDate.substring(6, 8));

	/**
	 * `month` is substracted by 1 as JS Date accepts month index starting from 0
	 */
	return new Date(year, month - 1, date);
}
