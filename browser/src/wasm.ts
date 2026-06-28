export { xxhashBase16, xxhashBase36, xxhashBase64Url } from '../../wasm/bindings_wasm.js';

import { parseAndWalkSync, parse as parseWasm } from '../../wasm/bindings_wasm.js';

// WebAssembly always emits little-endian words while all words of the returned
// buffers are read in host byte order, so on big-endian hosts swap each whole
// buffer once here. The wasm-bindgen glue hands over a fresh JS-owned copy,
// making this in-place swap safe.
const isBigEndianHost = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;
const toHostByteOrder = (result: Uint8Array): Uint8Array => {
	if (isBigEndianHost) {
		const words = new Uint32Array(result.buffer, result.byteOffset, result.byteLength >> 2);
		for (let index = 0; index < words.length; index++) {
			const word = words[index];
			words[index] =
				((word & 0xff) << 24) | ((word & 0xff00) << 8) | ((word >>> 8) & 0xff00) | (word >>> 24);
		}
	}
	return result;
};

export function parse(code: string, allowReturnOutsideFunction: boolean, jsx: boolean) {
	return toHostByteOrder(parseWasm(code, allowReturnOutsideFunction, jsx));
}

export async function parseAsync(code: string, allowReturnOutsideFunction: boolean, jsx: boolean) {
	return toHostByteOrder(parseWasm(code, allowReturnOutsideFunction, jsx));
}

export async function parseAndWalk(
	code: string,
	allowReturnOutsideFunction: boolean,
	jsx: boolean,
	walkedNodesBitset: BigUint64Array,
	collectScopes: boolean
) {
	return toHostByteOrder(
		parseAndWalkSync(code, allowReturnOutsideFunction, jsx, walkedNodesBitset, collectScopes)
	);
}
