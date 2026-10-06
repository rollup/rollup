#!/usr/bin/env node

import { select } from '@inquirer/prompts';
import { readFile, writeFile } from 'node:fs/promises';
import { chdir } from 'node:process';
import { fileURLToPath } from 'node:url';
import type { ReleaseType } from 'semver';
import semverInc from 'semver/functions/inc.js';
import semverParse from 'semver/functions/parse.js';
import semverPreRelease from 'semver/functions/prerelease.js';
import { bold, cyan } from './colors.ts';
import { readJson, runAndGetStdout, runWithEcho } from './helpers.ts';
import {
	BROWSER_PACKAGE,
	CHANGELOG,
	MAIN_BRANCH,
	MAIN_LOCKFILE,
	MAIN_PACKAGE
} from './release-constants.ts';
import {
	getChangelogEntry,
	getGithubApi,
	getGitTag,
	getIncludedPRs,
	getPreviousReleaseTag,
	type IncludedPR
} from './release-helpers.ts';

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
const [mainPackage, mainLockFile, browserPackage, repo] = await Promise.all([
	readJson(MAIN_PACKAGE),
	readJson(MAIN_LOCKFILE),
	readJson(BROWSER_PACKAGE),
	gh.getRepo('rollup', 'rollup')
]);
const isMainBranch = currentBranch === MAIN_BRANCH;
const previousReleaseTag = await getPreviousReleaseTag();
const includedPRs = await getIncludedPRs(
	previousReleaseTag,
	'HEAD',
	repo,
	currentBranch,
	!isMainBranch
);

console.log(bold(`\nPreparing release for "${currentBranch}". Included PRs:`));
console.log(
	includedPRs
		.map(
			({ text, pr, authors }) =>
				`https://github.com/rollup/rollup/pull/${pr}: ${text} (${authors.map(author => `@${author}`).join(', ')})`
		)
		.join('\n')
);
console.log();

const newVersion = await getNewVersion(mainPackage, isMainBranch);
const gitTag = getGitTag(newVersion);
if (await tagExists(gitTag)) {
	throw new Error(
		`Tag "${gitTag}" already exists. To prepare this release again, remove it via \`git tag -d ${gitTag}\` first.`
	);
}

try {
	if (isMainBranch) {
		await updateChangelogEntry(newVersion, includedPRs);
	}
	await updatePackages(mainPackage, mainLockFile, browserPackage, newVersion);
	await installDependenciesAndLint();
	if (isMainBranch) {
		await waitForChangelogUpdate(newVersion);
	}
	await commitChanges(newVersion, gitTag, isMainBranch);
} catch (error) {
	console.error(
		`Error during release, rolling back changes: ${error instanceof Error ? error.message : error}`
	);
	console.error('Run `git reset --hard` to roll back changes.');
	throw error;
}

await pushChanges(gitTag);

async function getNewVersion(
	mainPackage: Record<string, any>,
	isMainBranch: boolean
): Promise<string> {
	const { version } = mainPackage;
	const availableIncrements: ReleaseType[] = isMainBranch
		? ['patch', 'minor']
		: semverPreRelease(version)
			? ['prerelease']
			: ['premajor', 'preminor', 'prepatch'];

	return await select({
		choices: availableIncrements.map(increment => {
			const value = semverInc(version, increment) as string;
			return {
				name: `${increment} (${value})`,
				short: increment,
				value
			};
		}),
		message: `Select type of release (currently "${version}" on branch "${currentBranch}"):`
	});
}

async function updateChangelogEntry(newVersion: string, includedPRs: IncludedPR[]): Promise<void> {
	const changelog = await readFile(CHANGELOG, 'utf8');
	const entry = getChangelogEntry(changelog, newVersion);
	if (entry === null) {
		const insertPosition = getChangelogEntryInsertPosition(changelog);
		await writeFile(
			CHANGELOG,
			changelog.slice(0, insertPosition) +
				`${getNewLogEntry(newVersion, includedPRs)}\n\n` +
				changelog.slice(insertPosition)
		);
		console.log(
			cyan(`A stub for the release notes was added to the beginning of "${CHANGELOG}".
Please edit this file to add useful information about bug fixes, features and
breaking changes in the release while the tests are running.`)
		);
		return;
	}
	if (includedPRs.length === 0) {
		console.log(
			cyan(
				`The changelog entry for "${newVersion}" was left unchanged because the release does not contain any pull requests.`
			)
		);
		return;
	}
	const updatedEntryText = regeneratePullRequestsSection(entry.text, includedPRs);
	await writeFile(
		CHANGELOG,
		changelog.slice(0, entry.index) +
			updatedEntryText +
			changelog.slice(entry.index + entry.text.length)
	);
}

function getChangelogEntryInsertPosition(changelog: string): number {
	const firstEntryMatch = changelog.match(/^## /m);
	if (firstEntryMatch && typeof firstEntryMatch.index === 'number') {
		return firstEntryMatch.index;
	}
	const previousChangelogsMatch = changelog.match(/^For previous changelogs/m);
	if (previousChangelogsMatch && typeof previousChangelogsMatch.index === 'number') {
		return previousChangelogsMatch.index;
	}
	const titleMatch = changelog.match(/^# .*$/m);
	if (titleMatch && typeof titleMatch.index === 'number' && typeof titleMatch[0] === 'string') {
		const afterTitle = titleMatch.index + titleMatch[0].length;
		return afterTitle + (/^\n*/.exec(changelog.slice(afterTitle))?.[0].length ?? 0);
	}
	return 0;
}

function regeneratePullRequestsSection(entryText: string, prs: IncludedPR[]): string {
	const pullRequestsMatch = /^### Pull Requests$/m.exec(entryText);
	if (!pullRequestsMatch || typeof pullRequestsMatch.index !== 'number') {
		return `${entryText}\n\n${createPullRequestsSection(prs)}`;
	}
	const remainderAfterHeading = entryText.slice(
		pullRequestsMatch.index + pullRequestsMatch[0].length
	);
	const nextSectionMatch = remainderAfterHeading.match(/\n#{1,3} /);
	const followingText =
		typeof nextSectionMatch?.index === 'number'
			? remainderAfterHeading.slice(nextSectionMatch.index + 1)
			: '';
	return `${entryText.slice(0, pullRequestsMatch.index)}${createPullRequestsSection(prs)}${
		followingText ? `\n\n${followingText}` : ''
	}`;
}

function getNewLogEntry(version: string, prs: IncludedPR[]): string {
	if (prs.length === 0) {
		throw new Error(`Release does not contain any PRs`);
	}
	const firstPr = prs[0].pr;
	const date = new Date().toISOString().slice(0, 10);
	const parsedVersion = semverParse(version);
	if (!parsedVersion) {
		throw new Error(`Could not parse version ${version}.`);
	}
	const { minor, patch } = parsedVersion;
	let sections = getDummyLogSection('Bug Fixes', firstPr);
	if (patch === 0) {
		sections = getDummyLogSection('Features', firstPr) + sections;
		if (minor === 0) {
			sections = getDummyLogSection('Breaking Changes', firstPr) + sections;
		}
	}
	return `## ${version}

_${date}_

${sections}${createPullRequestsSection(prs)}`;
}

function createPullRequestsSection(prs: IncludedPR[]): string {
	return `### Pull Requests

${prs
	.map(
		({ text, pr, authors }) =>
			`- [#${pr}](https://github.com/rollup/rollup/pull/${pr}): ${text} (${authors.map(author => `@${author}`).join(', ')})`
	)
	.join('\n')}`;
}

function getDummyLogSection(headline: string, pr: number): string {
	return `### ${headline}

- [replace me] (#${pr})

`;
}

async function installDependenciesAndLint(): Promise<void> {
	await runWithEcho('npm', ['ci', '--ignore-scripts']);
	await runWithEcho('npm', ['run', 'check-audit']);
	await runWithEcho('npm', ['run', 'ci:lint']);
}

async function waitForChangelogUpdate(version: string): Promise<void> {
	let previousEntry = '';
	while (true) {
		await runWithEcho('npx', ['prettier', '--write', CHANGELOG]);
		const changelog = await readFile(CHANGELOG, 'utf8');
		const entry = getChangelogEntry(changelog, version);
		if (entry === null) {
			throw new Error(
				`The changelog entry for version "${version}" is missing. Do not remove or rename the "## ${version}" heading while editing the changelog.`
			);
		}
		if (entry.text === previousEntry) {
			console.log(cyan('No further changes, continuing release.'));
			break;
		}
		previousEntry = entry.text;
		console.log(cyan('You generated the following changelog entry:\n') + previousEntry);
		await select({
			choices: ['ok'],
			message: `Please edit the changelog or confirm the changelog is acceptable to continue to release "${version}".`
		});
	}
}

function updatePackages(
	mainPackage: Record<string, any>,
	mainLockFile: Record<string, any>,
	browserPackage: Record<string, any>,
	newVersion: string
): Promise<void[]> {
	return Promise.all([
		writeFile(MAIN_PACKAGE, updatePackageVersionAndGetString(mainPackage, newVersion)),
		writeFile(MAIN_LOCKFILE, updateLockFileVersionAndGetString(mainLockFile, newVersion)),
		writeFile(BROWSER_PACKAGE, updatePackageVersionAndGetString(browserPackage, newVersion))
	]);
}

function updatePackageVersionAndGetString(
	packageContent: Record<string, any>,
	version: string
): string {
	packageContent.version = version;
	return JSON.stringify(packageContent, null, 2) + '\n';
}

function updateLockFileVersionAndGetString(
	lockfileContent: Record<string, any>,
	version: string
): string {
	lockfileContent.version = version;
	lockfileContent.packages[''].version = version;
	return JSON.stringify(lockfileContent, null, 2) + '\n';
}

async function commitChanges(
	newVersion: string,
	gitTag: string,
	isMainBranch: boolean
): Promise<void> {
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

async function tagExists(tag: string): Promise<boolean> {
	try {
		return (
			(await runAndGetStdout('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`])).length > 0
		);
	} catch {
		return false;
	}
}

function pushChanges(gitTag: string): Promise<unknown> {
	return Promise.all([
		runWithEcho('git', ['push', 'origin', 'HEAD']),
		runWithEcho('git', ['push', 'origin', gitTag])
	]);
}
