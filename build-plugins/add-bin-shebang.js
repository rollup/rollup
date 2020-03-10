import MagicString from 'magic-string';

export default function addBinShebang() {
	return {
		name: 'add-bin-shebang',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/rollup') {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}
