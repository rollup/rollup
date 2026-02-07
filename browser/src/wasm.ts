export { parse, xxhashBase16, xxhashBase36, xxhashBase64Url } from '../../wasm/bindings_wasm.js';

import { parse, parseAndWalkSync } from '../../wasm/bindings_wasm.js';

export async function parseAsync(
	code: string,
	allowReturnOutsideFunction: boolean,
	jsx: boolean,
	_signal?: AbortSignal | undefined | null
) {
	return parse(code, allowReturnOutsideFunction, jsx);
}

export async function parseAndWalk(
	code: string,
	allowReturnOutsideFunction: boolean,
	jsx: boolean,
	walkedNodesBitset: Uint8Array,
	_signal?: AbortSignal | undefined | null
) {
	return parseAndWalkSync(code, allowReturnOutsideFunction, jsx, walkedNodesBitset);
}
