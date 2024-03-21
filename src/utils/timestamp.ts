/**
 * Generate a timestamp string based on the date & consumption index in the "300" record.
 *
 * @param index Consumption index
 * @param intervalLength Interval for each consumption value
 * @param date Date of the consumption
 * @returns String representation of timestamp
 */
export function getTimestamp(
	index: number,
	intervalLength: number,
	date: Date
) {
	const hour = getHourFromConsumptionIndex(index, intervalLength);
	const minute = getMinuteFromConsumptionIndex(index, intervalLength);

	/**
	 * Assuming MySQL database, where the timestamp format is 'YYYY-MM-DD hh:mm:ss'
	 */
	return `${date.getFullYear()}-${
		date.getMonth() + 1
	}-${date.getDate()} ${hour}:${minute}:00`;
}

function getHourFromConsumptionIndex(index: number, interval: number) {
	const hour = Math.floor((index * interval) / 60);
	return makeTwoDigit(hour);
}
function getMinuteFromConsumptionIndex(index: number, interval: number) {
	const minute = (index * interval) % 60;
	return makeTwoDigit(minute);
}

function makeTwoDigit(number: number) {
	let str = `${number}`;
	while (str.length < 2) {
		str = "0" + str;
	}
	return str;
}
