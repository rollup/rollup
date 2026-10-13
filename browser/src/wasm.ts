export { xxhashBase16, xxhashBase36, xxhashBase64Url } from '../../wasm/bindings_wasm.js';

import { parse as parseWasm } from '../../wasm/bindings_wasm.js';

// WebAssembly is always little-endian while the buffer is read in the byte
// order of the host, so on big-endian hosts the parser swaps the byte order
// of the 32-bit fields.
const swapByteOrder = new Uint8Array(new Uint32Array([1]).buffer)[0] === 0;

export function parse(code: string, allowReturnOutsideFunction: boolean, jsx: boolean) {
	return parseWasm(code, allowReturnOutsideFunction, jsx, swapByteOrder);
}

export async function parseAsync(
	code: string,
	allowReturnOutsideFunction: boolean,
	jsx: boolean,
	_signal?: AbortSignal | undefined | null
) {
	return parse(code, allowReturnOutsideFunction, jsx);
}
