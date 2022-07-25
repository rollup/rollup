#!/usr/bin/env node

// git pull --ff-only && npm ci && npm run lint:nofix && npm audit && npm run build:bootstrap && npm run test:all

import { fileURLToPath } from 'node:url';
import { chdir, exit } from 'process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { runAndGetStdout, runWithEcho } from './helpers.js';

// TODO Lukas extract functions to structure
const MAIN_BRANCH = 'master';
const MAIN_INCREMENTS = ['patch', 'minor'];
const BRANCH_INCREMENTS = ['premajor', 'preminor', 'prepatch'];
const PRE_RELEASE_INCREMENTS = ['prerelease'];

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const MAIN_PKG = 'package.json';
const BROWSER_PKG = 'browser/package.json';
const CHANGELOG = 'CHANGELOG.md';

// TODO Lukas enable
// await runWithEcho('git', ['pull', '--ff-only']);

const [pkg, currentBranch] = await Promise.all([
	readJson(MAIN_PKG),
	runAndGetStdout('git', ['branch', '--show-current'])
]);
const { version } = pkg;
const isPreRelease = !!semverPreRelease(version);
const isMainBranch = currentBranch === MAIN_BRANCH;

const availableIncrements = isMainBranch
	? MAIN_INCREMENTS
	: isPreRelease
	? PRE_RELEASE_INCREMENTS
	: BRANCH_INCREMENTS;

const { newVersion } = await inquirer.prompt([
	{
		choices: availableIncrements.map(increment => {
			const value = semverInc(version, increment);
			return {
				name: `${increment} (${value})`,
				short: increment,
				value
			};
		}),
		message: `Select type of release (currently "${version}" on branch "${currentBranch}"):`,
		name: 'newVersion',
		type: 'list'
	}
]);

// Find version in changelog
const changelog = await fs.readFile(CHANGELOG, 'utf8');
const x = getFirstChangelogEnry(changelog);

console.log(x);
exit();

// Install dependencies, build and run tests
// TODO Lukas enable
// await Promise.all([runWithEcho('npm', ['ci']), runWithEcho('npm', ['audit'])]);
// await Promise.all([
// 	runWithEcho('npm', ['run', 'lint:nofix']),
// 	runWithEcho('npm', ['run', 'build:bootstrap'])
// ]);
// await runWithEcho('npm', ['run', 'test:all']);

// TODO Lukas enable
// const browserPkg = await readJson(BROWSER_PKG);
// await Promise.all([
// 	fs.writeFile(MAIN_PKG, getPkgStringWithVersion(pkg, newVersion)),
// 	fs.writeFile(BROWSER_PKG, getPkgStringWithVersion(browserPkg, newVersion))
// ]);

// Commit changes
const gitTag = `v${newVersion}`;
// TODO Lukas enable
// await runWithEcho('git', ['add', MAIN_PKG, BROWSER_PKG]);
// await runWithEcho('git', ['commit', '-m', newVersion]);
// await runWithEcho('git', ['tag', gitTag]);

// Release
const releaseEnv = { ...process.env, ROLLUP_RELEASE: 'releasing' };
const releaseTag = isPreRelease ? ['--tag', 'beta'] : [];
await Promise.all([
	runWithEcho('npm', ['publish', '--dry-run', ...releaseTag], {
		cwd: new URL('..', import.meta.url),
		env: releaseEnv
	}),
	runWithEcho('npm', ['publish', '--dry-run', ...releaseTag], {
		cwd: new URL('../browser', import.meta.url),
		env: releaseEnv
	})
]);

// Push changes
await Promise.all([
	runWithEcho('git', ['push', 'origin', 'HEAD']),
	runWithEcho('git', ['push', 'origin', gitTag])
]);

async function readJson(file) {
	const content = await fs.readFile(file, 'utf8');
	return JSON.parse(content);
}

function getPkgStringWithVersion(pkg, version) {
	return JSON.stringify({ ...pkg, version }, null, 2) + '\n';
}

function getFirstChangelogEnry(changelog) {
	const match = changelog.match(/## (\d+\.\d+\.\d+)[\s\S]*?(?=\s## )/);
	if (!match) {
		throw new Error('Could not detect any changelog entry.');
	}
	const [entry, version] = match;
	const { index } = match;
	return { entry, index, version };
}
