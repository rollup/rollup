import init from '../wasm/bindings_wasm';
import wasm from '../wasm/bindings_wasm_bg.wasm';

export default async function initWasm() {
	await init(await wasm());
}
