const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
const base = 64;

export function toBase64(value: number): string {
	let outString = '';
	do {
		const currentDigit = value % base;
		value = (value / base) | 0;
		outString = chars[currentDigit] + outString;
	} while (value !== 0);
	return outString;
}
