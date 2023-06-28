import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import type { Plugin } from 'rollup';

const execPromise = promisify(exec);

export function linkNativeFiles(): Plugin {
	return {
		name: 'copy-native-files',
		async resolveId(id, importer) {
			if (id.endsWith('/native/lib.js')) {
				return {
					...(await this.resolve(id, importer, { skipSelf: true }))!,
					external: 'relative'
				};
			}
		},
		// TODO Lukas this only works in Unix-like environments
		async writeBundle() {
			try {
				const { stdout, stderr } = await execPromise(
					`ln -s ../native ${fileURLToPath(new URL(`../dist/native`, import.meta.url))}`
				);
				if (stdout || stderr) {
					console.error(stderr, stdout);
				}
			} catch (error) {
				console.error(error);
			}
		}
	};
}
