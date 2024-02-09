// eslint-disable-next-line import/no-unresolved
export { parse, xxhashBase64Url, xxhashBase36, xxhashBase16 } from '../../wasm/bindings_wasm.js';

// eslint-disable-next-line import/no-unresolved
import { parse } from '../../wasm/bindings_wasm.js';
export async function parseAsync(
	code: string,
	allowReturnOutsideFunction: boolean,
	_signal?: AbortSignal | undefined | null
) {
	return parse(code, allowReturnOutsideFunction);
}
