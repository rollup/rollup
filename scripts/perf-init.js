/* eslint-disable no-console */

import { fileURLToPath } from 'url';
import { execa } from 'execa';
import fs from 'fs-extra';
import { findConfigFileName } from './find-config.js';

const TARGET_DIR = fileURLToPath(new URL('../perf', import.meta.url).href);
const VALID_REPO = /^([^/\s#]+\/[^/\s#]+)(#([^/\s#]+))?$/;
const repoWithBranch = process.argv[2];

if (process.argv.length !== 3 || !VALID_REPO.test(repoWithBranch)) {
	console.error(
		'You need to provide a GitHub repo in the form <username>/<repo> or <username>/<repo>#branch, e.g. ' +
			'"npm run perf:init rollup/rollup"'
	);
	process.exit(1);
}

console.error(`Cleaning up '${TARGET_DIR}'...`);
fs.removeSync(TARGET_DIR);

const [, repo, , branch] = VALID_REPO.exec(repoWithBranch);

setupNewRepo(repo, branch).catch(error => {
	console.error(error.message);
	process.exit(1);
});

function execWithOutput(command, args) {
	const call = execa(command, args);
	call.stderr.pipe(process.stderr);
	return call;
}

async function setupNewRepo(repo, branch) {
	const gitArgs = ['clone', '--depth', 1, '--progress'];
	if (branch) {
		console.error(`Cloning branch "${branch}" of "${repo}"...`);
		gitArgs.push('--branch', branch);
	} else {
		console.error(`Cloning "${repo}"...`);
	}
	gitArgs.push(`https://github.com/${repo}.git`, TARGET_DIR);
	await execWithOutput('git', gitArgs);
	await findConfigFileName(TARGET_DIR);
	process.chdir(TARGET_DIR);
	await execWithOutput('npm', ['install']);
}
