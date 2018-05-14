const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_';

export function toBase64(num: number) {
	let outStr = '';
	do {
		const curDigit = num % 64;
		num = Math.floor(num / 64);
		outStr = chars[curDigit] + outStr;
	} while (num !== 0);
	return outStr;
}
