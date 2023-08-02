// eslint-disable-next-line import/no-unresolved
import init from '../wasm/bindings_wasm';
// eslint-disable-next-line import/no-unresolved
import wasm from '../wasm/bindings_wasm_bg.wasm';

export default async function initWasm() {
	await init(await wasm());
}
