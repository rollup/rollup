/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const sander = require('sander');
const repoWithBranch = process.argv[2];

const TARGET_DIR = path.resolve(__dirname, '..', 'perf');
const VALID_REPO = /^([^/\s#]+\/[^/\s#]+)(#([^/\s#]+))?$/;

if (process.argv.length !== 3 || !VALID_REPO.test(repoWithBranch)) {
	console.error(
		'You need to provide a GitHub repo in the form <username>/<repo> or <username>/<repo>#branch, e.g. ' +
			'"npm run perf:init rollup/rollup"'
	);
	process.exit(1);
}
console.error(`Cleaning up '${TARGET_DIR}'...`);
sander.rimrafSync(TARGET_DIR);

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
	try {
		fs.accessSync(path.resolve(TARGET_DIR, 'rollup.config.js'), fs.constants.R_OK);
	} catch (e) {
		throw new Error('The repository needs to have a file "rollup.config.js" at the top level.');
	}
	process.chdir(TARGET_DIR);
	await execWithOutput('npm', ['install']);
}
