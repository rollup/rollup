import { chmod } from 'node:fs/promises';
import { resolve } from 'node:path';
import MagicString from 'magic-string';
import type { Plugin } from 'rollup';

const CLI_CHUNK = 'bin/rollup';

export default function addCliEntry(): Plugin {
	return {
		buildStart() {
			this.emitFile({
				fileName: CLI_CHUNK,
				id: 'cli/cli.ts',
				preserveSignature: false,
				type: 'chunk'
			});
		},
		name: 'add-cli-entry',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === CLI_CHUNK) {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
			return null;
		},
		writeBundle({ dir }) {
			return chmod(resolve(dir!, CLI_CHUNK), '755');
		}
	};
}
