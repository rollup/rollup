import { readFile } from 'node:fs/promises';
import type { Plugin } from 'rollup';

export function emitNativeEntry(): Plugin {
	return {
		async generateBundle() {
			this.emitFile({
				fileName: 'native.js',
				source: await readFile(new URL('../native.js', import.meta.url)),
				type: 'asset'
			});
		},
		name: 'emit-native-entry'
	};
}
