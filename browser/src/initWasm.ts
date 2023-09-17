// eslint-disable-next-line import/no-unresolved
import init from '../../wasm/bindings_wasm';

export default async function initWasm() {
	await init();
}
