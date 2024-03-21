import { getTimestamp } from "./timestamp";

describe("getTimestamp()", () => {
	it("should return the correct timestamp for index 0, interval 30 mins", () => {
		const timestamp = getTimestamp(0, 30, new Date(2024, 2, 1));
		expect(timestamp).toBe("2024-03-01 00:00:00");
	});

	it("should return the correct timestamp for index 47, interval 30 mins", () => {
		const timestamp = getTimestamp(47, 30, new Date(2024, 2, 1));
		expect(timestamp).toBe("2024-03-01 23:30:00");
	});

	it("should return the correct timestamp for index 47, interval 15 mins", () => {
		const timestamp = getTimestamp(47, 15, new Date(2024, 2, 1));
		expect(timestamp).toBe("2024-03-01 11:45:00");
	});

	it("should return the correct timestamp for index 47, interval 5 mins", () => {
		const timestamp = getTimestamp(47, 5, new Date(2024, 2, 1));
		expect(timestamp).toBe("2024-03-01 03:55:00");
	});
});
