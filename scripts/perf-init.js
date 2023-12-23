/* eslint-disable no-console */

import { rmSync } from 'node:fs';
import { argv, chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { findConfigFileName } from './find-config.js';
import { runWithEcho } from './helpers.js';

const TARGET_DIR = fileURLToPath(new URL('../perf', import.meta.url).href);
const VALID_REPO = /^([^\s#/]+\/[^\s#/]+)(#([^\s#/]+))?$/;
const repoWithBranch = argv[2];

if (argv.length !== 3 || !VALID_REPO.test(repoWithBranch)) {
	console.error(
		'You need to provide a GitHub repo in the form <username>/<repo> or <username>/<repo>#branch, e.g. ' +
			'"npm run perf:init rollup/rollup"'
	);
	exit(1);
}

console.error(`Cleaning up '${TARGET_DIR}'...`);
rmSync(TARGET_DIR, {
	force: true,
	recursive: true
});

const repoWithBranchMatch = VALID_REPO.exec(repoWithBranch);
if (!repoWithBranchMatch) {
	throw new Error('Could not match repository and branch.');
}
const [, repo, , branch] = repoWithBranchMatch;

const gitArguments = ['clone', '--depth', '1', '--progress'];
if (branch) {
	console.error(`Cloning branch "${branch}" of "${repo}"...`);
	gitArguments.push('--branch', branch);
} else {
	console.error(`Cloning "${repo}"...`);
}
gitArguments.push(`https://github.com/${repo}.git`, TARGET_DIR);
await runWithEcho('git', gitArguments);
await findConfigFileName(TARGET_DIR);
chdir(TARGET_DIR);
await runWithEcho('npm', ['install']);
