#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'node:url';
import { chdir, exit } from 'process';
import GitHub from 'github-api';
import inquirer from 'inquirer';
import semverInc from 'semver/functions/inc.js';
import semverParse from 'semver/functions/parse.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { cyan, red } from './colors.js';
import { runAndGetStdout, runWithEcho } from './helpers.js';

// We execute everything from the main directory
chdir(fileURLToPath(new URL('..', import.meta.url)));

const MAIN_BRANCH = 'master';
const MAIN_PKG = 'package.json';
const BROWSER_PKG = 'browser/package.json';
const CHANGELOG = 'CHANGELOG.md';

const [gh] = await Promise.all([getGithubApi(), runWithEcho('git', ['pull', '--ff-only'])]);
const [pkg, browserPkg, currentBranch, repo] = await Promise.all([
	readJson(MAIN_PKG),
	readJson(BROWSER_PKG),
	runAndGetStdout('git', ['branch', '--show-current']),
	gh.getRepo('rollup', 'rollup')
]);
const isMainBranch = currentBranch === MAIN_BRANCH;
const newVersion = await getNewVersion(pkg, isMainBranch);
if (isMainBranch) {
	await addStubChangelogEntry(newVersion);
}
await installDependenciesBuildAndTest();
const changelogEntry = isMainBranch ? await waitForChangelogUpdate(newVersion) : '';
await updatePackages(pkg, browserPkg);
const gitTag = `v${newVersion}`;
await commitChanges(newVersion, gitTag);
await releasePackages(newVersion);
await pushChanges(gitTag);
if (changelogEntry) {
	await createReleaseNotes(changelogEntry, gitTag);
}

async function getGithubApi() {
	const GITHUB_TOKEN = '.github_token';
	try {
		const token = (await readFile(GITHUB_TOKEN, 'utf8')).trim();
		return new GitHub({ token });
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.error(
				`Could not find GitHub token file. Please create "${GITHUB_TOKEN}" containing a token with the following permissions:
- public_repo`
			);
			exit(1);
		} else {
			throw err;
		}
	}
}

async function readJson(file) {
	const content = await readFile(file, 'utf8');
	return JSON.parse(content);
}

async function getNewVersion(pkg, isMainBranch) {
	const { version } = pkg;
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

async function addStubChangelogEntry(version) {
	const changelog = await readFile(CHANGELOG, 'utf8');
	const { currentVersion, index } = getFirstChangelogEntry(changelog);
	if (currentVersion === version) {
		console.error(
			`Changelog entry for version "${version}" already exists. Please remove the entry and commit the change before trying again.`
		);
		exit(1);
	}

	const prs = await getIncludedPRs(currentVersion, gh);
	await writeFile(
		CHANGELOG,
		changelog.slice(0, index) + getNewLogEntry(version, prs) + '\n\n' + changelog.slice(index)
	);

	console.log(
		cyan(`A stub for the release notes was added to the beginning of "${CHANGELOG}".
Please edit this file to add useful information about bug fixes, features and
breaking changes in the release while the tests are running.`)
	);
}

function getFirstChangelogEntry(changelog) {
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

async function getIncludedPRs(previousVersion, repo) {
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
		prs.push({ pr: match[2], text: match[1].split('\n')[0] });
	}
	prs.sort((a, b) => (a.pr > b.pr ? 1 : -1));
	return Promise.all(
		prs.map(async ({ pr, text }) => ({
			author: (await repo.getPullRequest(pr)).data.user.login,
			pr,
			text
		}))
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
		runWithEcho('npm', ['run', 'lint:nofix']),
		runWithEcho('npm', ['run', 'build:bootstrap'])
	]);
	await runWithEcho('npm', ['run', 'test:all']);
}

async function waitForChangelogUpdate(version) {
	const { changelogUpdated } = await inquirer.prompt([
		{
			message: `Please confirm that the changelog has been updated to continue`,
			name: 'changelogUpdated',
			type: 'confirm'
		}
	]);

	if (!changelogUpdated) {
		console.log(red`Aborting release.`);
		exit();
	}

	let changelogEntry = '';
	while (true) {
		await runWithEcho('npx', ['prettier', '--write', CHANGELOG]);
		const changelog = await readFile(CHANGELOG, 'utf8');
		const { text: newEntry } = getFirstChangelogEntry(changelog);
		if (newEntry !== changelogEntry) {
			changelogEntry = newEntry;
			console.log(cyan('You generated the following changelog entry:\n') + changelogEntry);
			const { changelogConfirmed } = await inquirer.prompt([
				{
					message: `Please edit the changelog again or confirm the changelog is acceptable to continue to release "${version}".`,
					name: 'changelogConfirmed',
					type: 'confirm'
				}
			]);
			if (!changelogConfirmed) {
				console.log(red`Aborting release.`);
				exit();
			}
			continue;
		}
		break;
	}

	console.log(cyan('No further changes, continuing release.'));
	return changelogEntry;
}

function updatePackages(pkg, browserPkg) {
	return Promise.all([
		writeFile(MAIN_PKG, getPkgStringWithVersion(pkg, newVersion)),
		writeFile(BROWSER_PKG, getPkgStringWithVersion(browserPkg, newVersion))
	]);
}

function getPkgStringWithVersion(pkg, version) {
	return JSON.stringify({ ...pkg, version }, null, 2) + '\n';
}

async function commitChanges(newVersion, gitTag) {
	await runWithEcho('git', ['add', MAIN_PKG, BROWSER_PKG]);
	await runWithEcho('git', ['commit', '-m', newVersion]);
	await runWithEcho('git', ['tag', gitTag]);
}

function releasePackages(newVersion) {
	const releaseEnv = { ...process.env, ROLLUP_RELEASE: 'releasing' };
	const releaseTag = semverPreRelease(newVersion) ? ['--tag', 'beta'] : [];
	return Promise.all([
		runWithEcho('npm', ['publish', '--dry-run', ...releaseTag], {
			cwd: new URL('..', import.meta.url),
			env: releaseEnv
		}),
		runWithEcho('npm', ['publish', '--dry-run', ...releaseTag], {
			cwd: new URL('../browser', import.meta.url),
			env: releaseEnv
		})
	]);
}

function pushChanges(gitTag) {
	return Promise.all([
		runWithEcho('git', ['push', 'origin', 'HEAD']),
		runWithEcho('git', ['push', 'origin', gitTag])
	]);
}

function createReleaseNotes(changelog, tag) {
	return repo.createRelease({
		body: changelog,
		name: tag,
		tag_name: tag
	});
}
