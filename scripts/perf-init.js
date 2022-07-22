/* eslint-disable no-console */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { findConfigFileName } from './find-config.js';

const spawnPromise = (command, args) => {
	return new Promise((resolve, reject) => {
		const childProcess = spawn(command, args);

		childProcess.stdout.pipe(process.stdout);
		childProcess.stderr.pipe(process.stderr);

		childProcess.on('close', code => {
			if (code) {
				reject(new Error(`"${[command, ...args].join(' ')}" exited with code ${code}.`));
			} else {
				resolve();
			}
		});
	});
};

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

const gitArgs = ['clone', '--depth', 1, '--progress'];
if (branch) {
	console.error(`Cloning branch "${branch}" of "${repo}"...`);
	gitArgs.push('--branch', branch);
} else {
	console.error(`Cloning "${repo}"...`);
}
gitArgs.push(`https://github.com/${repo}.git`, TARGET_DIR);
await spawnPromise('git', gitArgs);
await findConfigFileName(TARGET_DIR);
process.chdir(TARGET_DIR);
await spawnPromise('npm', ['install']);
