import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'rollup';

function copyRollupType(
	fileName: string,
	inputFile = 'src/rollup/types.d.ts',
	rollupImportPath?: string
): Plugin {
	return {
		async generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				let source = await readFile(resolve(inputFile), 'utf8');
				if (rollupImportPath) {
					source = source.replace(rollupImportPath, './rollup');
				}
				this.emitFile({ fileName, source, type: 'asset' });
			}
		},
		name: 'copy-rollup-type'
	};
}

export function copyBrowserTypes(): Plugin {
	return copyRollupType('rollup.browser.d.ts');
}

export function copyNodeTypes(): Plugin[] {
	return [
		copyRollupType('rollup.d.ts'),
		copyRollupType(
			'loadConfigFile.d.ts',
			'cli/run/loadConfigFileType.d.ts',
			'../../src/rollup/types'
		),
		copyRollupType('getLogFilter.d.ts', 'src/utils/getLogFilterType.d.ts', '../rollup/types')
	];
}
