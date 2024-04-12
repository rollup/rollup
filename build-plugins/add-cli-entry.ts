import { chmod } from 'node:fs/promises';
import path from 'node:path';
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
		writeBundle({ dir }) {
			return chmod(path.resolve(dir!, CLI_CHUNK), '755');
		}
	};
}
