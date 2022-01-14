import { dirname, join, resolve } from 'path';
import type { Plugin } from 'rollup';

const ID_CRYPTO = resolve('src/utils/crypto');
const ID_FS = resolve('src/utils/fs');
const ID_HOOKACTIONS = resolve('src/utils/hookActions');
const ID_PATH = resolve('src/utils/path');
const ID_PERFORMANCE = resolve('src/utils/performance');
const ID_PROCESS = resolve('src/utils/process');
const ID_RESOLVEID = resolve('src/utils/resolveId');

export default function replaceBrowserModules(): Plugin {
	return {
		name: 'replace-browser-modules',
		resolveId(source, importee) {
			if (importee && source[0] === '.') {
				const resolved = join(dirname(importee), source);
				switch (resolved) {
					case ID_CRYPTO:
						return resolve('browser/crypto.ts');
					case ID_FS:
						return resolve('browser/fs.ts');
					case ID_HOOKACTIONS:
						return resolve('browser/hookActions.ts');
					case ID_PATH:
						return resolve('browser/path.ts');
					case ID_PERFORMANCE:
						return resolve('browser/performance.ts');
					case ID_PROCESS:
						return resolve('browser/process.ts');
					case ID_RESOLVEID:
						return resolve('browser/resolveId.ts');
				}
			}
		}
	};
}
