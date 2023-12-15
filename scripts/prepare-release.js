#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverParse from 'semver/functions/parse.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { cyan } from './colors.js';
import { readJson, runAndGetStdout, runWithEcho } from './helpers.js';
import {
	BROWSER_PACKAGE,
	CHANGELOG,
	MAIN_BRANCH,
	MAIN_LOCKFILE,
	MAIN_PACKAGE
} from './release-constants.js';
import {
	getFirstChangelogEntry,
	getGithubApi,
	getGitTag,
	getIncludedPRs
} from './release-helpers.js';

console.log(
	`-----------------------------------------------------------------------------
This script will create a release tag for you and guide you through writing a
CHANGELOG entry for non-beta releases. The actual release will be performed
by GitHub Actions once this script completes successfully.
-----------------------------------------------------------------------------`
);

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const [gh, currentBranch] = await Promise.all([
	getGithubApi(),
	runAndGetStdout('git', ['branch', '--show-current']),
	runWithEcho('git', ['pull', '--ff-only'])
]);
const [mainPackage, mainLockFile, browserPackage, repo, changelog] = await Promise.all([
	readJson(MAIN_PACKAGE),
	readJson(MAIN_LOCKFILE),
	readJson(BROWSER_PACKAGE),
	gh.getRepo('rollup', 'rollup'),
	readFile(CHANGELOG, 'utf8')
]);
const isMainBranch = currentBranch === MAIN_BRANCH;
const [newVersion, includedPRs] = await Promise.all([
	getNewVersion(mainPackage, isMainBranch),
	getIncludedPRs(
		`v${getFirstChangelogEntry(changelog).currentVersion}`,
		'HEAD',
		repo,
		currentBranch,
		!isMainBranch
	)
]);

const gitTag = getGitTag(newVersion);
try {
	if (isMainBranch) {
		await addStubChangelogEntry(newVersion, repo, changelog, includedPRs);
	}
	await updatePackages(mainPackage, mainLockFile, browserPackage, newVersion);
	await installDependenciesAndLint();
	if (isMainBranch) {
		await waitForChangelogUpdate(newVersion);
	}
	await commitChanges(newVersion, gitTag, isMainBranch);
} catch (error) {
	console.error(`Error during release, rolling back changes: ${error.message}`);
	console.error('Run `git reset --hard` to roll back changes.');
	throw error;
}

await pushChanges(gitTag);

async function getNewVersion(mainPackage, isMainBranch) {
	const { version } = mainPackage;
	const availableIncrements = isMainBranch
		? ['patch', 'minor']
		: semverPreRelease(version)
			? ['prerelease']
			: ['premajor', 'preminor', 'prepatch'];

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
	return newVersion;
}

async function addStubChangelogEntry(version, repo, changelog, includedPRs) {
	const { currentVersion, index } = getFirstChangelogEntry(changelog);
	if (currentVersion === version) {
		console.error(
			`Changelog entry for version "${version}" already exists. Please remove the entry and commit the change before trying again.`
		);
		exit(1);
	}

	await writeFile(
		CHANGELOG,
		changelog.slice(0, index) +
			getNewLogEntry(version, includedPRs) +
			'\n\n' +
			changelog.slice(index)
	);

	console.log(
		cyan(`A stub for the release notes was added to the beginning of "${CHANGELOG}".
Please edit this file to add useful information about bug fixes, features and
breaking changes in the release while the tests are running.`)
	);
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

${prs
	.map(
		({ text, pr, author }) =>
			`- [#${pr}](https://github.com/rollup/rollup/pull/${pr}): ${text} (@${author})`
	)
	.join('\n')}`;
}

function getDummyLogSection(headline, pr) {
	return `### ${headline}

- [replace me] (#${pr})

`;
}

async function installDependenciesAndLint() {
	await Promise.all([
		runWithEcho('npm', ['ci', '--ignore-scripts']),
		runWithEcho('npm', ['audit'])
	]);
	await runWithEcho('npm', ['run', 'ci:lint']);
}

async function waitForChangelogUpdate(version) {
	let changelogEntry = '';
	while (true) {
		await runWithEcho('npx', ['prettier', '--write', CHANGELOG]);
		const changelog = await readFile(CHANGELOG, 'utf8');
		const { text: newEntry } = getFirstChangelogEntry(changelog);
		if (newEntry === changelogEntry) {
			console.log(cyan('No further changes, continuing release.'));
			break;
		}
		changelogEntry = newEntry;
		console.log(cyan('You generated the following changelog entry:\n') + changelogEntry);
		await inquirer.prompt([
			{
				choices: ['ok'],
				message: `Please edit the changelog or confirm the changelog is acceptable to continue to release "${version}".`,
				name: 'ok',
				type: 'list'
			}
		]);
	}
}

function updatePackages(mainPackage, mainLockFile, browserPackage, newVersion) {
	return Promise.all([
		writeFile(MAIN_PACKAGE, updatePackageVersionAndGetString(mainPackage, newVersion)),
		writeFile(MAIN_LOCKFILE, updateLockFileVersionAndGetString(mainLockFile, newVersion)),
		writeFile(BROWSER_PACKAGE, updatePackageVersionAndGetString(browserPackage, newVersion))
	]);
}

function updatePackageVersionAndGetString(packageContent, version) {
	packageContent.version = version;
	return JSON.stringify(packageContent, null, 2) + '\n';
}

function updateLockFileVersionAndGetString(lockfileContent, version) {
	lockfileContent.version = version;
	lockfileContent.packages[''].version = version;
	return JSON.stringify(lockfileContent, null, 2) + '\n';
}

async function commitChanges(newVersion, gitTag, isMainBranch) {
	await runWithEcho('git', [
		'add',
		MAIN_PACKAGE,
		MAIN_LOCKFILE,
		BROWSER_PACKAGE,
		...(isMainBranch ? [CHANGELOG] : [])
	]);
	await runWithEcho('git', ['commit', '-m', newVersion]);
	await runWithEcho('git', ['tag', gitTag]);
}

function pushChanges(gitTag) {
	return Promise.all([
		runWithEcho('git', ['push', 'origin', 'HEAD']),
		runWithEcho('git', ['push', 'origin', gitTag])
	]);
}
