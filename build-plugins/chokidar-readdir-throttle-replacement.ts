import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

const NODEFS_HANDLER = 'node_modules/chokidar/lib/nodefs-handler.js';
// chokidar uses a shared per-directory throttle for reading the directory, so
// when several watched files in the same directory do not exist yet, all but
// one directory read are silently discarded and file creations are never
// reported, see https://github.com/rollup/rollup/issues/6574. Keying the
// throttle by watched file gives each missing file its own directory read.
const SHARED_DIRECTORY_READ_THROTTLE = "this.fsw._throttle('readdir', directory, 1000)";
const PER_TARGET_DIRECTORY_READ_THROTTLE =
	"this.fsw._throttle('readdir', target ? sysPath.join(directory, target) : directory, 1000)";

let fileContent: string;

try {
	fileContent = await readFile(NODEFS_HANDLER, 'utf8');
} catch {
	console.error(`Could not find "${NODEFS_HANDLER}".`);
	exit(1);
}

const occurrences = fileContent.split(SHARED_DIRECTORY_READ_THROTTLE).length - 1;
if (occurrences !== 1) {
	console.error(
		`Expected exactly one occurrence of the shared directory-read throttle in "${NODEFS_HANDLER}" but found ${occurrences}.`
	);
	exit(1);
}

export const chokidarReaddirThrottleReplacement: RollupReplaceOptions = {
	delimiters: ['', ''],
	include: NODEFS_HANDLER,
	preventAssignment: true, // defaults to true in next major version of plugin
	values: {
		[SHARED_DIRECTORY_READ_THROTTLE]: PER_TARGET_DIRECTORY_READ_THROTTLE
	}
};
