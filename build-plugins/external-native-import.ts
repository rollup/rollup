import { readFile } from 'node:fs/promises';
import type { Plugin } from 'rollup';

export function externalNativeImport(): Plugin {
	return {
		async generateBundle() {
			this.emitFile({
				fileName: 'native.cjs',
				source: await readFile(new URL('../native.js', import.meta.url)),
				type: 'asset'
			});
		},
		name: 'copy-native-files',
		async resolveId(id, importer) {
			if (id.includes('/native')) {
				const resolved = await this.resolve(id, importer!, { skipSelf: true });
				return {
					external: 'relative',
					id: resolved!.id
				};
			}
		}
	};
}
