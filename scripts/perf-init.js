/* eslint-disable no-console */

const execa = require('execa');
const path = require('path');
const fs = require('fs');
const sander = require('sander');
const repo = process.argv[2];

const TARGET_DIR = path.resolve(__dirname, '..', 'perf');
const VALID_REPO = /^[^/\s]+\/[^/\s]+$/;

if (process.argv.length !== 3 || !VALID_REPO.test(repo)) {
	console.error(
		'You need to provide a GitHub repo in the form <username>/<repo>, e.g. ' +
			'"npm run perf:init rollup/rollup"'
	);
	process.exit(1);
}

console.error(`Cleaning up '${TARGET_DIR}'...`);
sander.rimrafSync(TARGET_DIR);

const cloneRepo = execa('git', ['clone', `https://github.com/${repo}.git`, TARGET_DIR]);
cloneRepo.stderr.pipe(process.stderr);
cloneRepo
	.catch(() => process.exit(1))
	.then(() => fs.accessSync(path.resolve(TARGET_DIR, 'rollup.config.js'), fs.constants.R_OK))
	.catch(() => {
		console.error('The repository needs to have a file "rollup.config.js" at the top level');
		process.exit(1);
	})
	.then(() => process.chdir(TARGET_DIR))
	.then(() => {
		const npmInstall = execa('npm', ['install']);
		npmInstall.stderr.pipe(process.stderr);
	})
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
