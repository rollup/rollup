import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'rollup';

export default function copyTypes(fileName: string): Plugin {
	return {
		async generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				this.emitFile({
					fileName,
					source: await readFile(resolve('src/rollup/types.d.ts'), 'utf8'),
					type: 'asset'
				});
			}
		},
		name: 'copy-types'
	};
}

export function copyAllTypes(): Plugin[] {
	return [
		copyTypes('rollup.d.ts'),
		{
			async generateBundle(_options, _bundle, isWrite) {
				if (isWrite) {
					this.emitFile({
						fileName: 'loadConfigFile.d.ts',
						source: (await readFile(resolve('cli/run/loadConfigFileType.d.ts'), 'utf8')).replace(
							'../../src/rollup/types',
							'./rollup'
						),
						type: 'asset'
					});
				}
			},
			name: 'copy-loadConfigFile-type'
		}
	];
}
