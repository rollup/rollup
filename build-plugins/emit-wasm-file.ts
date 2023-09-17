import fs from 'node:fs/promises';
import type { Plugin } from 'rollup';

export default function emitWasmFile(): Plugin {
	return {
		async generateBundle() {
			this.emitFile({
				fileName: 'bindings_wasm_bg.wasm',
				source: await fs.readFile('wasm/bindings_wasm_bg.wasm'),
				type: 'asset'
			});
		},
		name: 'emit-wasm-file'
	};
}
