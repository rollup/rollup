import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

const FSEVENTS_HANDLER = 'node_modules/chokidar/lib/fsevents-handler.js';
const FSEVENTS_REQUIRE = "require('fsevents')";
const FSEVENTS_REQUIRE_REPLACEMENT =
	"require('../../../src/watch/fsevents-importer').getFsEvents()";

let fileContent: string;

try {
	fileContent = await readFile(FSEVENTS_HANDLER, 'utf8');
} catch {
	console.error(`Could not find "${FSEVENTS_HANDLER}".`);
	exit(1);
}

if (!fileContent.includes(FSEVENTS_REQUIRE)) {
	console.error(`Could not find expected fsevents import "${FSEVENTS_REQUIRE}"`);
	exit(1);
}

export const fsEventsReplacement: RollupReplaceOptions = {
	delimiters: ['', ''],
	include: FSEVENTS_HANDLER,
	preventAssignment: true, // defaults to true in next major version of plugin
	values: {
		[FSEVENTS_REQUIRE]: FSEVENTS_REQUIRE_REPLACEMENT
	}
};
