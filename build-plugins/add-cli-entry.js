import MagicString from 'magic-string';

export default function addCliEntry() {
	return {
		buildStart() {
			this.emitFile({
				fileName: 'bin/rollup',
				id: 'cli/cli.ts',
				preserveSignature: false,
				type: 'chunk'
			});
		},
		name: 'add-cli-entry',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/rollup') {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}
