import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'rollup';

export function externalNativeImport(): Plugin {
	return {
		async generateBundle() {
			this.emitFile({
				fileName: 'native.cjs',
				source: await readFile(new URL('../native.cjs', import.meta.url)),
				type: 'asset'
			});
		},
		name: 'copy-native-files',
		async resolveId(id) {
			if (id.includes('/native')) {
				return {
					external: 'relative',
					id: resolve('native.cjs')
				};
			}
		}
	};
}
