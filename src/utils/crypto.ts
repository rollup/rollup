import { xxhashBase64Url } from '../../native';

let textEncoder: TextEncoder;
export function getXxhash(input: string | Uint8Array) {
	let buffer: Uint8Array;
	if (typeof input === 'string') {
		if (typeof Buffer === 'undefined') {
			textEncoder ??= new TextEncoder();
			buffer = textEncoder.encode(input);
		} else {
			buffer = Buffer.from(input);
		}
	} else {
		buffer = input;
	}
	return xxhashBase64Url(buffer);
}
