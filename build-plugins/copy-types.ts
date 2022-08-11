import { resolve } from 'node:path';
import { readFile } from 'fs-extra';
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
