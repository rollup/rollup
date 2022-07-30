import { remove } from 'fs-extra';
import type { Plugin } from 'rollup';

export default function cleanBeforeWrite(dir: string): Plugin {
	let removePromise: Promise<void> | null = null;
	return {
		generateBundle(_options, _bundle, isWrite) {
			if (isWrite) {
				// Only remove before first write, but make all writes wait on the removal
				removePromise ||= remove(dir);
				return removePromise;
			}
		},
		name: 'clean-before-write'
	};
}
