import { readFile } from 'node:fs/promises';
import GitHub from 'github-api';
import semverPreRelease from 'semver/functions/prerelease.js';
import { cyan } from './colors.js';
import { runAndGetStdout } from './helpers.js';
import { CHANGELOG, MAIN_BRANCH } from './release-constants.js';
import {
	getCurrentCommitMessage,
	getFirstChangelogEntry,
	getGitTag,
	getIncludedPRs
} from './release-helpers.js';

console.log(
	`-------------------------------------------------------------------------------
This script will create the release in GitHub and post comments to all released
PRs and resolved issues. It is only run from CI.
-------------------------------------------------------------------------------`
);

if (!(process.env.CI && process.env.ROLLUP_RELEASE && process.env.GITHUB_TOKEN)) {
	throw new Error('This script is only intended to be run from CI.');
}

const gh = new GitHub({ token: process.env.GITHUB_TOKEN });
const [currentBranch, newVersion, changelog, repo, issues] = await Promise.all([
	runAndGetStdout('git', ['branch', '--show-current']),
	getCurrentCommitMessage(),
	readFile(CHANGELOG, 'utf8'),
	gh.getRepo('rollup', 'rollup'),
	gh.getIssues('rollup', 'rollup')
]);
if (!newVersion.test(/^\d+\.\d+\.\d+(-\d)?$/)) {
	throw new Error(`The last commit message "${newVersion}" does not contain a version.`);
}

const isMainBranch = currentBranch === MAIN_BRANCH;
console.log('DEBUG: currentBranch', currentBranch, isMainBranch);

const firstEntry = getFirstChangelogEntry(changelog);
const [previousVersion, changelogEntry] =
	firstEntry.currentVersion === newVersion
		? [firstEntry.previousVersion, firstEntry.text]
		: [firstEntry.currentVersion, null];
const includedPRs = await getIncludedPRs(previousVersion, repo, currentBranch, isMainBranch);

if (changelogEntry) {
	await createReleaseNotes(changelogEntry, getGitTag(newVersion));
}
await postReleaseComments(includedPRs, issues, newVersion);

function createReleaseNotes(changelog, tag) {
	return repo.createRelease({
		body: changelog,
		name: tag,
		tag_name: tag
	});
}

function postReleaseComments(includedPRs, issues, version) {
	const isPreRelease = semverPreRelease(version);
	const installNote = isPreRelease
		? `Note that this is a pre-release, so to test it, you need to install Rollup via \`npm install rollup@${version}\` or \`npm install rollup@beta\`. It will likely become part of a regular release later.`
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
