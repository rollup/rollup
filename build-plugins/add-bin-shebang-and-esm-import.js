import MagicString from 'magic-string';

const ESM_IMPORT_PLACEHOLDER = 'esmDynamicImport';

export default function addBinShebangAndEsmImport() {
	return {
		name: 'add-bin-shebang-and-esm-import',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/rollup') {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				const esmImportPos = code.indexOf('esmDynamicImport');

				// TODO Lukas find a better solution
				magicString.overwrite(esmImportPos, esmImportPos + ESM_IMPORT_PLACEHOLDER.length, 'import');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}
