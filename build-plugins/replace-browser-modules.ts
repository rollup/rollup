import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'rollup';

const resolve = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

export const resolutions: ReadonlyMap<string, string> = new Map([
	[resolve('src/utils/crypto'), resolve('browser/src/crypto.ts')],
	[resolve('src/utils/fs'), resolve('browser/src/fs.ts')],
	[resolve('src/utils/hookActions'), resolve('browser/src/hookActions.ts')],
	[resolve('src/utils/path'), resolve('browser/src/path.ts')],
	[resolve('src/utils/performance'), resolve('browser/src/performance.ts')],
	[resolve('src/utils/process'), resolve('browser/src/process.ts')],
	[resolve('src/utils/resolveId'), resolve('browser/src/resolveId.ts')]
]);

export default function replaceBrowserModules(): Plugin {
	return {
		name: 'replace-browser-modules',
		resolveId(source, importer) {
			if (importer && source[0] === '.') {
				const resolved = join(dirname(importer), source);

				return resolutions.get(resolved);
			}
		}
	};
}
