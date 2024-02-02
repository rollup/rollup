import { xxhashBase16, xxhashBase36, xxhashBase64Url } from '../../native';

let textEncoder: TextEncoder;

export const getHash64 = (input: string | Uint8Array) => xxhashBase64Url(ensureBuffer(input));
export const getHash36 = (input: string | Uint8Array) => xxhashBase36(ensureBuffer(input));
export const getHash16 = (input: string | Uint8Array) => xxhashBase16(ensureBuffer(input));

function ensureBuffer(input: string | Uint8Array): Uint8Array {
	if (typeof input === 'string') {
		if (typeof Buffer === 'undefined') {
			textEncoder ??= new TextEncoder();
			return textEncoder.encode(input);
		}
		return Buffer.from(input);
	}
	return input;
}
