import { xxhashBase16, xxhashBase36, xxhashBase64Url } from '../../native';
import type { HashCharacters } from '../rollup/types';

let textEncoder: TextEncoder;

export type GetHash = (input: string | Uint8Array) => string;

export const getHash64: GetHash = input => xxhashBase64Url(ensureBuffer(input));
export const getHash36: GetHash = input => xxhashBase36(ensureBuffer(input));
export const getHash16: GetHash = input => xxhashBase16(ensureBuffer(input));

export const hasherByType: Record<HashCharacters, GetHash> = {
	base36: getHash36,
	base64: getHash64,
	hex: getHash16
};

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
