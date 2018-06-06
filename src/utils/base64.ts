const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';

export function toBase64(num: number, base63 = false) {
	let outStr = '';
	const base = base63 ? 63 : 64;
	do {
		const curDigit = num % base;
		num = Math.floor(num / base);
		outStr = chars[curDigit] + outStr;
	} while (num !== 0);
	return outStr;
}
