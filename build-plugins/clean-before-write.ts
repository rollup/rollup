import fs from 'fs-extra';
import type { Plugin } from 'rollup';

export default function cleanBeforeWrite(directory: string): Plugin {
	let removePromise: Promise<void> | null = null;
	return {
		generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				// Only remove before first write, but make all writes wait on the removal
				removePromise ||= fs.remove(directory);
				return removePromise;
			}
		},
		name: 'clean-before-write'
	};
}
