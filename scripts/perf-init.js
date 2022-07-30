/* eslint-disable no-console */

import { argv, chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { findConfigFileName } from './find-config.js';
import { runWithEcho } from './helpers.js';

const TARGET_DIR = fileURLToPath(new URL('../perf', import.meta.url).href);
const VALID_REPO = /^([^/\s#]+\/[^/\s#]+)(#([^/\s#]+))?$/;
const repoWithBranch = argv[2];

if (argv.length !== 3 || !VALID_REPO.test(repoWithBranch)) {
	console.error(
		'You need to provide a GitHub repo in the form <username>/<repo> or <username>/<repo>#branch, e.g. ' +
			'"npm run perf:init rollup/rollup"'
	);
	exit(1);
}

console.error(`Cleaning up '${TARGET_DIR}'...`);
fs.removeSync(TARGET_DIR);

const [, repo, , branch] = VALID_REPO.exec(repoWithBranch);

const gitArgs = ['clone', '--depth', 1, '--progress'];
if (branch) {
	console.error(`Cloning branch "${branch}" of "${repo}"...`);
	gitArgs.push('--branch', branch);
} else {
	console.error(`Cloning "${repo}"...`);
}
gitArgs.push(`https://github.com/${repo}.git`, TARGET_DIR);
await runWithEcho('git', gitArgs);
await findConfigFileName(TARGET_DIR);
chdir(TARGET_DIR);
await runWithEcho('npm', ['install']);
