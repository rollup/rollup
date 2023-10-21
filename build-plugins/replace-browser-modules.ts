import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin as RollupPlugin } from 'rollup';
import type { Plugin } from 'vite';

const resolve = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

const JS_REPLACED_MODULES = [
	'fs',
	'hookActions',
	'path',
	'performance',
	'process',
	'resolveId',
	'initWasm'
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

const wasmModulesMap: ModulesMap = [[resolve('native'), resolve('browser/src/wasm.ts')]];

const resolutions: ReadonlyMap<string, string> = new Map([...jsModulesMap, ...wasmModulesMap]);

export default function replaceBrowserModules(): Plugin & RollupPlugin {
	return {
		apply: 'serve',
		enforce: 'pre',
		name: 'replace-browser-modules',
		resolveId(source: string, importer: string | undefined) {
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
