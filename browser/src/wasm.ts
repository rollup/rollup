// eslint-disable-next-line import/no-unresolved
export { parse, xxhash_base64_url as xxhashBase64Url } from '../../wasm/bindings_wasm.js';

import { parse } from '../../wasm/bindings_wasm.js';
export async function parseAsync(
	code: string,
	allowReturnOutsideFunction: boolean,
	_signal?: AbortSignal | undefined | null
) {
	return parse(code, allowReturnOutsideFunction);
}
