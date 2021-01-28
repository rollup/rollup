import path from 'path';

const ID_CRYPTO = path.resolve('src/utils/crypto');
const ID_FS = path.resolve('src/utils/fs');
const ID_PATH = path.resolve('src/utils/path');
const ID_RESOLVEID = path.resolve('src/utils/resolveId');

export default function replaceBrowserModules() {
	return {
		name: 'replace-browser-modules',
		resolveId: (source, importee) => {
			if (importee && source[0] === '.') {
				const resolved = path.join(path.dirname(importee), source);
				switch (resolved) {
					case ID_CRYPTO:
						return path.resolve('browser/crypto.ts');
					case ID_FS:
						return path.resolve('browser/fs.ts');
					case ID_PATH:
						return path.resolve('browser/path.ts');
					case ID_RESOLVEID:
						return path.resolve('browser/resolveId.ts');
				}
			}
		}
	};
}
