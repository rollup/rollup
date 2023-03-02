import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'rollup';

const resolve = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

const REPLACED_MODULES = [
	'crypto',
	'fs',
	'hookActions',
	'path',
	'performance',
	'process',
	'resolveId'
];

export const resolutions: ReadonlyMap<string, string> = new Map(
	REPLACED_MODULES.flatMap(module => {
		const originalId = resolve(`src/utils/${module}`);
		const replacementId = resolve(`browser/src//${module}.ts`);
		return [
			[originalId, replacementId],
			[`${originalId}.ts`, replacementId]
		];
	})
);

export default function replaceBrowserModules(): Plugin {
	return {
		name: 'replace-browser-modules',
		resolveId(source, importer) {
			if (importer && source[0] === '.') {
				return resolutions.get(join(dirname(importer), source));
			}
		}
	};
}
