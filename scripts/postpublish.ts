import GitHub, { type Issues } from 'github-api';
import { readFile } from 'node:fs/promises';
import { env } from 'node:process';
import semverPreRelease from 'semver/functions/prerelease.js';
import { cyan } from './colors.ts';
import { runWithEcho } from './helpers.ts';
import { CHANGELOG, DOCUMENTATION_BRANCH } from './release-constants.ts';
import {
	getChangelogEntry,
	getCurrentCommitMessage,
	getGitTag,
	getIncludedPRs,
	getPreviousReleaseTag,
	type IncludedPR
} from './release-helpers.ts';

console.log(
	`-------------------------------------------------------------------------------
This script will create the release in GitHub and post comments to all released
PRs and resolved issues. It is only run from CI.
-------------------------------------------------------------------------------`
);

if (!(env.CI && env.ROLLUP_RELEASE && env.GITHUB_TOKEN)) {
	throw new Error('This script is only intended to be run from CI.');
}

const gh = new GitHub({ token: env.GITHUB_TOKEN });
const [newVersion, repo, issues] = await Promise.all([
	getCurrentCommitMessage(),
	gh.getRepo('rollup', 'rollup'),
	gh.getIssues('rollup', 'rollup')
]);

const matched = /^\d+\.\d+\.\d+(-\d+)?$/.exec(newVersion);
if (!matched) {
	throw new Error(`The last commit message "${newVersion}" does not contain a version.`);
}

const isPreRelease = !!matched[1];
const gitTag = getGitTag(newVersion);
const previousVersion = await getPreviousReleaseTag(gitTag);
const includedPRs = await getIncludedPRs(previousVersion, gitTag, repo, null, isPreRelease);

if (!isPreRelease) {
	const changelog = await readFile(CHANGELOG, 'utf8');
	const releaseEntry = getChangelogEntry(changelog, newVersion);
	if (releaseEntry !== null) {
		await createReleaseNotes(releaseEntry.text, gitTag);
	}
}

await postReleaseComments(includedPRs, issues, newVersion);

if (!isPreRelease) {
	await runWithEcho('git', ['branch', DOCUMENTATION_BRANCH, '--force', gitTag]);
	await runWithEcho('git', ['push', '--force', 'origin', DOCUMENTATION_BRANCH]);
}

function createReleaseNotes(changelog: string, tag: string): Promise<void> {
	return repo.createRelease({
		body: changelog,
		name: tag,
		tag_name: tag
	});
}

async function postReleaseComments(
	includedPRs: IncludedPR[],
	issues: Issues,
	version: string
): Promise<void> {
	const installNote = semverPreRelease(version)
		? `Note that this is a pre-release, so to test it, you need to install Rollup via \`npm install rollup@${version}\` or \`npm install rollup@beta\`. It will likely become part of a regular release later.`
		: 'You can test it via `npm install rollup`.';

	let caughtError: unknown = null;

	const addComment = (issueNumber: number, comment: string): Promise<unknown> =>
		// Add a small timeout to avoid rate limiting issues
		new Promise(resolve => setTimeout(resolve, 500)).then(() =>
			issues
				.createIssueComment(issueNumber, `${comment} as part of rollup@${version}. ${installNote}`)
				.catch(error => {
					console.error(error);
					caughtError ||= error;
				})
		);

	for (const { pr, closed } of includedPRs) {
		await addComment(pr, 'This PR has been released');
		console.log(cyan(`Added release comment to #${pr}.`));

		for (const closedIssue of closed) {
			await addComment(closedIssue, `This issue has been resolved via #${pr}`);
			console.log(cyan(`Added fix comment to #${closedIssue} via #${pr}.`));
		}
	}
	if (caughtError) {
		throw caughtError;
	}
}
