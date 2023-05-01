#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { chdir, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import GitHub from 'github-api';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverParse from 'semver/functions/parse.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { cyan } from './colors.js';
import { runAndGetStdout, runWithEcho } from './helpers.js';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const MAIN_BRANCH = 'master';
const MAIN_PACKAGE = 'package.json';
const MAIN_LOCKFILE = 'package-lock.json';
const BROWSER_PACKAGE = 'browser/package.json';
const CHANGELOG = 'CHANGELOG.md';
const DOCUMENTATION_BRANCH = 'documentation-published';

const [gh, currentBranch] = await Promise.all([
	getGithubApi(),
	runAndGetStdout('git', ['branch', '--show-current']),
	runWithEcho('git', ['pull', '--ff-only'])
]);
const [mainPackage, mainLockFile, browserPackage, repo, issues, changelog] = await Promise.all([
	readJson(MAIN_PACKAGE),
	readJson(MAIN_LOCKFILE),
	readJson(BROWSER_PACKAGE),
	gh.getRepo('rollup', 'rollup'),
	gh.getIssues('rollup', 'rollup'),
	readFile(CHANGELOG, 'utf8')
]);
const isMainBranch = currentBranch === MAIN_BRANCH;
const [newVersion, includedPRs] = await Promise.all([
	getNewVersion(mainPackage, isMainBranch),
	getIncludedPRs(changelog, repo, currentBranch, isMainBranch)
]);

let changelogEntry, gitTag;
try {
	if (isMainBranch) {
		await addStubChangelogEntry(newVersion, repo, changelog, includedPRs);
	}
	await updatePackages(mainPackage, mainLockFile, browserPackage, newVersion);
	await installDependenciesBuildAndTest();
	changelogEntry = isMainBranch ? await waitForChangelogUpdate(newVersion) : '';
	gitTag = `v${newVersion}`;
	await commitChanges(newVersion, gitTag, isMainBranch);
} catch (error) {
	console.error(`Error during release, rolling back changes: ${error.message}`);
	await runWithEcho('git', ['reset', '--hard']);
	throw error;
}

await releasePackages(newVersion);
await pushChanges(gitTag);
if (changelogEntry) {
	await createReleaseNotes(changelogEntry, gitTag);
}
await postReleaseComments(includedPRs, issues, newVersion);

async function getGithubApi() {
	const GITHUB_TOKEN = '.github_token';
	try {
		const token = (await readFile(GITHUB_TOKEN, 'utf8')).trim();
		return new GitHub({ token });
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.error(
				`Could not find GitHub token file. Please create "${GITHUB_TOKEN}" containing a token with the following permissions:
- public_repo`
			);
			exit(1);
		} else {
			throw error;
		}
	}
}

async function readJson(file) {
	const content = await readFile(file, 'utf8');
	return JSON.parse(content);
}

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

function getFirstChangelogEntry(changelog) {
	const match = changelog.match(
		/(?<text>## (?<currentVersion>\d+\.\d+\.\d+)[\S\s]*?)\n+## (?<previousVersion>\d+\.\d+\.\d+)/
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

async function getIncludedPRs(changelog, repo, currentBranch, isMainBranch) {
	const { currentVersion } = getFirstChangelogEntry(changelog);
	const commits = await runAndGetStdout('git', [
		'--no-pager',
		'log',
		`v${currentVersion}..HEAD`,
		'--pretty=tformat:%s'
	]);
	const getPrRegExp = /^(.+)\s\(#(\d+)\)$/gm;
	const prs = [];
	let match;
	while ((match = getPrRegExp.exec(commits))) {
		prs.push({ pr: match[2], text: match[1].split('\n')[0] });
	}

	if (!isMainBranch) {
		const { data: basePrs } = await repo.listPullRequests({
			head: `rollup:${currentBranch}`,
			state: 'open'
		});
		for (const { number, title } of basePrs) {
			prs.push({ pr: number, text: title });
		}
	}
	prs.sort((a, b) => (a.pr > b.pr ? 1 : -1));
	return Promise.all(
		prs.map(async ({ pr, text }) => {
			const { data } = await repo.getPullRequest(pr);
			const bodyWithoutComments = data.body.replace(/<!--[\S\s]*?-->/g, '');
			const closedIssuesRegexp = /([Ff]ix(es|ed)?|([Cc]lose|[Rr]esolve)[ds]?) #(\d+)/g;
			const closed = [];
			while ((match = closedIssuesRegexp.exec(bodyWithoutComments))) {
				closed.push(match[4]);
			}
			return {
				author: data.user.login,
				closed,
				pr,
				text
			};
		})
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

async function installDependenciesBuildAndTest() {
	await Promise.all([runWithEcho('npm', ['ci']), runWithEcho('npm', ['audit'])]);
	await Promise.all([
		runWithEcho('npm', ['run', 'ci:lint']),
		runWithEcho('npm', ['run', 'build:bootstrap'])
	]);
	await runWithEcho('npm', ['run', 'test:all']);
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

	return changelogEntry;
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
	await Promise.all([
		runWithEcho('git', ['tag', gitTag]),
		isMainBranch && runWithEcho('git', ['branch', DOCUMENTATION_BRANCH, '--force', gitTag])
	]);
}

function releasePackages(newVersion) {
	const releaseEnvironment = { ...process.env, ROLLUP_RELEASE: 'releasing' };
	const releaseTag = semverPreRelease(newVersion) ? ['--tag', 'beta'] : [];
	const parameters = ['publish', '--access', 'public', ...releaseTag];
	return Promise.all([
		runWithEcho('npm', parameters, {
			cwd: new URL('..', import.meta.url),
			env: releaseEnvironment
		}),
		runWithEcho('npm', parameters, {
			cwd: new URL('../browser', import.meta.url),
			env: releaseEnvironment
		})
	]);
}

function pushChanges(gitTag) {
	return Promise.all([
		runWithEcho('git', ['push', 'origin', 'HEAD']),
		runWithEcho('git', ['push', 'origin', gitTag]),
		isMainBranch && runWithEcho('git', ['push', '--force', 'origin', DOCUMENTATION_BRANCH])
	]);
}

function createReleaseNotes(changelog, tag) {
	return repo.createRelease({
		body: changelog,
		name: tag,
		tag_name: tag
	});
}

function postReleaseComments(includedPRs, issues, version) {
	const isPreRelease = semverPreRelease(newVersion);
	const installNote = isPreRelease
		? `Note that this is a pre-release, so to test it, you need to install Rollup via \`npm install rollup@${newVersion}\` or \`npm install rollup@beta\`. It will likely become part of a regular release later.`
		: 'You can test it via `npm install rollup`.';
	return Promise.all(
		includedPRs.map(({ pr, closed }) =>
			Promise.all([
				issues
					.createIssueComment(
						pr,
						`This PR has been released as part of rollup@${version}. ${installNote}`
					)
					.then(() => console.log(cyan(`Added release comment to #${pr}.`))),
				...closed.map(closedPr =>
					issues
						.createIssueComment(
							closedPr,
							`This issue has been resolved via #${pr} as part of rollup@${version}. ${installNote}`
						)
						.then(() => console.log(cyan(`Added fix comment to #${closedPr} via #${pr}.`)))
				)
			])
		)
	);
}
