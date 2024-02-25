import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';
import GitHub from 'github-api';
import { runAndGetStdout } from './helpers.js';

/**
 * @param {string} changelog
 * @returns {{ currentVersion: string, index: number, previousVersion: string, text: string }}
 */
export function getFirstChangelogEntry(changelog) {
	const match = changelog.match(
		/(?<text>## (?<currentVersion>\d+\.\d+\.\d+(-\d+)?)[\S\s]*?)\n+## (?<previousVersion>\d+\.\d+\.\d+)/
	);
	if (!match || !match.groups || typeof match.index !== 'number') {
		throw new Error('Could not detect any changelog entry.');
	}
	const {
		groups: { text, currentVersion, previousVersion },
		index
	} = match;
	return { currentVersion, index, previousVersion, text };
}

/**
 * @typedef {object} IncludedPR
 * @property {string[]} authors
 * @property {number[]} closed - which PRs are closed by this
 * @property {number} pr
 * @property {string} text
 */

/**
 * @param {string} fromVersion
 * @param {string} toVersion
 * @param {import('github-api').Repo} repo
 * @param {string|null} currentBranch We only have a branch when locally prepare a release, otherwise we use the sha to find the PR
 * @param {boolean} isPreRelease
 * @returns {Promise<IncludedPR[]>}
 */
export async function getIncludedPRs(fromVersion, toVersion, repo, currentBranch, isPreRelease) {
	const [commits, commitSha] = await Promise.all([
		runAndGetStdout('git', [
			'--no-pager',
			'log',
			`${fromVersion}..${toVersion}`,
			'--pretty=tformat:%s'
		]),
		runAndGetStdout('git', ['rev-parse', toVersion])
	]);
	const getPrRegExp = /^(.+)\s\(#(\d+)\)$/gm;
	const prs = [];
	let match;
	while ((match = getPrRegExp.exec(commits))) {
		prs.push({ pr: Number(match[2]), text: match[1].split('\n')[0] });
	}

	if (isPreRelease) {
		const { data: basePrs } = await repo.listPullRequests({
			state: 'open',
			...(currentBranch ? { head: `rollup:${currentBranch}` } : {})
		});
		for (const {
			number,
			title,
			head: { sha }
		} of basePrs) {
			if (currentBranch || sha === commitSha) {
				prs.push({ pr: number, text: title });
			}
		}
	}
	prs.sort((a, b) => (a.pr > b.pr ? 1 : -1));
	return Promise.all(
		prs.map(async ({ pr, text }) => {
			const [{ data: pullRequest }, { data: commits }] = await Promise.all([
				repo.getPullRequest(pr),
				repo.listCommitsOnPR(pr)
			]);
			const mainAuthor = pullRequest.user.login;
			const otherAuthors = new Set(commits.map(({ author: { login } }) => login));
			otherAuthors.delete(mainAuthor);
			const bodyWithoutComments = pullRequest.body.replace(/<!--[\S\s]*?-->/g, '');
			const closedIssuesRegexp = /([Ff]ix(es|ed)?|([Cc]lose|[Rr]esolve)[ds]?) #(\d+)/g;
			const closed = [];
			while ((match = closedIssuesRegexp.exec(bodyWithoutComments))) {
				closed.push(Number(match[4]));
			}
			return {
				authors: [mainAuthor, ...otherAuthors],
				closed,
				pr,
				text
			};
		})
	);
}

/**
 * @return {Promise<GitHub>}
 */
export async function getGithubApi() {
	const GITHUB_TOKEN = '.github_token';
	try {
		const token = (await readFile(GITHUB_TOKEN, 'utf8')).trim();
		return new GitHub({ token });
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
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

/**
 * @param {string} version
 * @return {string}
 */
export function getGitTag(version) {
	return `v${version}`;
}

/**
 * @return {Promise<string>}
 */
export function getCurrentCommitMessage() {
	return runAndGetStdout('git', ['--no-pager', 'log', '-1', '--pretty=%B']);
}
