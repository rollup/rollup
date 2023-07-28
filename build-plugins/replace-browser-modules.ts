import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import type { Plugin } from 'vite';

const resolve = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

const JS_REPLACED_MODULES = [
	'crypto',
	'fs',
	'hookActions',
	'path',
	'performance',
	'process',
	'resolveId'
];

type ModulesMap = [string, string][];

const jsModulesMap: ModulesMap = JS_REPLACED_MODULES.flatMap(module => {
	const originalId = resolve(`src/utils/${module}`);
	const replacementId = resolve(`browser/src/${module}.ts`);
	return [
		[originalId, replacementId],
		[`${originalId}.ts`, replacementId]
	];
});

const wasmModulesMap: ModulesMap = [[resolve('native/lib'), resolve('browser/src/native.ts')]];

const resolutions: ReadonlyMap<string, string> = new Map([...jsModulesMap, ...wasmModulesMap]);

export default function replaceBrowserModules(): Plugin {
	return {
		apply: 'serve',
		enforce: 'pre',
		name: 'replace-browser-modules',
		resolveId(source, importer) {
			if (importer && source[0] === '.') {
				return resolutions.get(join(dirname(importer), source));
			}
		},
		transformIndexHtml(html) {
			// Unfortunately, picomatch sneaks as a dedendency into the dev bundle.
			// This fixes an error.
			return html.replace('</head>', '<script>window.process={}</script></head>');
		}
	};
}

const WASM_IMPORT_PLACEHOLDER = '/** WASM_IMPORT_PLACEHOLDER */';
const WASM_INIT_PLACEHOLDER = '/** WASM_INIT_PLACEHOLDER */';

const WASM_IMPORT = `
import init from '../../browser/wasm/parse_ast';
import wasm from '../../browser/wasm/parse_ast_bg.wasm';
`;

const WASM_INIT = `
await init(await wasm())
`;

export const wasmReplacement: RollupReplaceOptions = {
	delimiters: ['', ''],
	include: ['src/rollup/rollup.ts'],
	preventAssignment: true,
	values: {
		[WASM_IMPORT_PLACEHOLDER]: WASM_IMPORT,
		[WASM_INIT_PLACEHOLDER]: WASM_INIT
	}
};
