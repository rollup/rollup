import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'rollup';

const browserTypeCommentPattern =
	/\/\*browser:\s*((?:(?!\*\/)[\s\S])*?)\s*\*\/\s*((?:(?!\/\*browser)[\s\S])*?)\s*\/\*browser\*\//gu;

function replaceBrowserTypeComments(source: string, fileName: string, browser: boolean): string {
	const replacedSource = source.replace(browserTypeCommentPattern, browser ? '$1' : '$2');
	if (replacedSource.includes('/*browser')) {
		throw new Error(`Could not resolve all browser type comments while generating ${fileName}.`);
	}
	if (browser && /\bBuffer\b/u.test(replacedSource)) {
		throw new Error(`Browser types must not reference Buffer (found in ${fileName}).`);
	}
	return replacedSource;
}

interface CopyRollupTypeOptions {
	browser?: boolean;
	inputFile?: string;
	rollupImportPath?: string;
}

function copyRollupType(fileName: string, options: CopyRollupTypeOptions = {}): Plugin {
	const { browser = false, inputFile = 'src/rollup/types.d.ts', rollupImportPath } = options;
	return {
		async generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				let source = await readFile(path.resolve(inputFile), 'utf8');
				if (rollupImportPath) {
					source = source.replace(rollupImportPath, './rollup');
				}
				source = replaceBrowserTypeComments(source, fileName, browser);
				this.emitFile({ fileName, source, type: 'asset' });
			}
		},
		name: 'copy-rollup-type'
	};
}

export function copyBrowserTypes(): Plugin[] {
	return [
		copyRollupType('rollup.browser.d.ts', { browser: true }),
		copyRollupType('ast-types.d.ts', { browser: true, inputFile: 'src/rollup/ast-types.d.ts' })
	];
}

export function copyNodeTypes(): Plugin[] {
	return [
		copyRollupType('rollup.d.ts'),
		copyRollupType('ast-types.d.ts', { inputFile: 'src/rollup/ast-types.d.ts' }),
		copyRollupType('loadConfigFile.d.ts', {
			inputFile: 'cli/run/loadConfigFileType.d.ts',
			rollupImportPath: '../../src/rollup/types'
		}),
		copyRollupType('getLogFilter.d.ts', {
			inputFile: 'src/utils/getLogFilterType.d.ts',
			rollupImportPath: '../rollup/types'
		}),
		copyRollupType('parseAst.d.ts', {
			inputFile: 'src/utils/parseAstType.d.ts',
			rollupImportPath: '../rollup/types'
		})
	];
}
