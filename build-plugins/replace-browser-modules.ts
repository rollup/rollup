import { dirname, join, resolve } from 'node:path';
import type { Plugin } from 'rollup';

const resolutions = {
	[resolve('src/utils/crypto')]: resolve('browser/src/crypto.ts'),
	[resolve('src/utils/fs')]: resolve('browser/src/fs.ts'),
	[resolve('src/utils/hookActions')]: resolve('browser/src/hookActions.ts'),
	[resolve('src/utils/path')]: resolve('browser/src/path.ts'),
	[resolve('src/utils/performance')]: resolve('browser/src/performance.ts'),
	[resolve('src/utils/process')]: resolve('browser/src/process.ts'),
	[resolve('src/utils/resolveId')]: resolve('browser/src/resolveId.ts')
};

export default function replaceBrowserModules(): Plugin {
	return {
		name: 'replace-browser-modules',
		resolveId(source, importee) {
			if (importee && source[0] === '.') {
				const resolved = join(dirname(importee), source);
				if (resolutions[resolved]) {
					return resolutions[resolved];
				}
			}
		}
	};
}
