import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'rollup';

export function copyNativeFiles(): Plugin {
	return {
		async generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				this.emitFile({
					fileName: 'native/lib.js',
					source: await readFile(resolve('native/lib.js')),
					type: 'asset'
				});
				this.emitFile({
					fileName: 'native/rollup.node',
					source: await readFile(resolve('native/rollup.node')),
					type: 'asset'
				});
			}
		},
		name: 'copy-native-files',
		async resolveId(id, importer) {
			if (id.endsWith('/native/lib.js')) {
				return {
					...(await this.resolve(id, importer, { skipSelf: true }))!,
					external: 'relative'
				};
			}
		}
	};
}
