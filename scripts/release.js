#!/usr/bin/env node

// git pull --ff-only && npm ci && npm run lint:nofix && npm audit && npm run build:bootstrap && npm run test:all

import { fileURLToPath } from 'node:url';
import { chdir, exit } from 'process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverParse from 'semver/functions/parse.js';
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

// read log
// (*) text missing ?
// - create text
// - Ask to edit file
// - Confirm when done
// - Read log again
// print text
// confirm?
// read text again
// did not change? break
// Otherwise (*)
const changelog = await fs.readFile(CHANGELOG, 'utf8');
const { currentVersion, index, previousVersion, text } = getFirstChangelogEnry(changelog);
do {
	if (currentVersion !== newVersion) {
		const updatedLog =
			changelog.slice(0, index) +
			`## ${newVersion}

_${new Date().toISOString().slice(0, 10)}_

### Features

- Introduce \`maxParallelFileOps\` to limit both read and write operations, default to 20 and replaces \`maxParallelFileRead\` (#4570)

### Bug Fixes

- Avoid including variables referenced from return statements that are never reached (#4573)

### Pull Requests

- [#4570](https://github.com/rollup/rollup/pull/4570): Introduce maxParallelFileOps to limit parallel writes (@lukastaegert)
- [#4572](https://github.com/rollup/rollup/pull/4572): Document more ways to read package.json in ESM (@berniegp)
- [#4573](https://github.com/rollup/rollup/pull/4573): Do not include unused return expressions (@lukastaegert)
`;
	}
	const changelog = await fs.readFile(CHANGELOG, 'utf8');
	const { currentVersion, index, previousVersion, text } = getFirstChangelogEnry(changelog);

	// console.log(bold(cyan`New changelog entry:`));
	let entryText = '';
	if (currentVersion === newVersion) {
		entryText = text;
		const result = await inquirer.prompt([
			{
				message: `Confirm changelog and release "${newVersion}"? (otherwise edit the changelog and select "n")`,
				name: 'continue',
				type: 'confirm'
			}
		]);
		console.log(result);
	}
	break;
} while (true);
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
	const match = changelog.match(
		/(?<text>## (?<currentVersion>\d+\.\d+\.\d+)[\s\S]*?)\n+## (?<previousVersion>\d+\.\d+\.\d+)/
	);
	if (!match) {
		throw new Error('Could not detect any changelog entry.');
	}
	const {
		groups: { text, currentVersion, previousVersion },
		index
	} = match;
	return { currentVersion, index, previousVersion, text };
}

function getNewLogEntry(version, prs) {
	if (prs.length === 0) {
		throw new Error(`Release does not contain any PRs`);
	}
	const firstPr = prs[0].pr;
	const date = new Date().toISOString().slice(0, 10);
	const { minor, patch } = semverParse(version);
	let sections = getDummyLogSection('Bug Fixes', firstPr);
	if (patch === 0) {
		sections = getDummyLogSection('Features', firstPr) + sections;
		if (minor === 0) {
			sections = getDummyLogSection('Breaking Changes', firstPr) + sections;
		}
	}
	return `## ${version}

_${date}_

${sections}### Pull Requests

${prs.map(
	({ text, pr }) =>
		`- [#${pr}](https://github.com/rollup/rollup/pull/${pr}): ${text} (@lukastaegert)\n`
)}`;
}

function getDummyLogSection(headline, pr) {
	return `### ${headline}

- <replace me> (#${pr})

`;
}

async function getIncludedPRs(previousVersion) {
	const commits = await runAndGetStdout('git', [
		'--no-pager',
		'log',
		`v${previousVersion}..HEAD`,
		'--pretty=tformat:%s'
	]);
	const getPrRegExp = /^([^(]+)\s\(#(\d+)\)$/gm;
	const prs = [];
	let match;
	while ((match = getPrRegExp.exec(commits))) {
		prs.push({ pr: match[2], text: match[1] });
	}
	return prs;
}
