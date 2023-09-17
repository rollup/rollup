// eslint-disable-next-line import/no-unresolved
import './wasm/bindings_wasm_bg.wasm';

declare module './wasm/bindings_wasm_bg.wasm' {
	export default function wasm(): Promise<WebAssembly.Module>;
}
