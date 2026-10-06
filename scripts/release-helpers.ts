import GitHub, { type Repo } from 'github-api';
import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';
import semverGt from 'semver/functions/gt.js';
import { runAndGetStdout } from './helpers.ts';

export interface IncludedPR {
	authors: string[];
	/** which PRs are closed by this */
	closed: number[];
	pr: number;
	text: string;
}

export interface ChangelogEntry {
	index: number;
	text: string;
}

const releaseTagRegExp = /^v\d+\.\d+\.\d+$/;
const changelogBoundaryRegExp = /\n+(?=## |For previous changelogs)|\n+$/;

export async function getPreviousReleaseTag(excludedTag?: string): Promise<string> {
	const tagList = await runAndGetStdout('git', ['tag', '--list', '--merged', 'HEAD']);
	const previousTag = tagList
		.split('\n')
		.filter(tag => releaseTagRegExp.test(tag) && tag !== excludedTag)
		.reduce<string | null>(
			(previousSoFar, tag) =>
				previousSoFar === null || semverGt(tag.slice(1), previousSoFar.slice(1))
					? tag
					: previousSoFar,
			null
		);
	if (previousTag === null) {
		throw new Error(
			`Could not find any previous release tag among the ancestors of HEAD${excludedTag === undefined ? '' : ` (excluding ${excludedTag})`}.`
		);
	}
	return previousTag;
}

export function getChangelogEntry(changelog: string, version: string): ChangelogEntry | null {
	const escapedVersion = version.replaceAll('.', '\\.');
	const headingMatch = changelog.match(new RegExp(`^## ${escapedVersion}$`, 'mu'));
	if (!headingMatch || typeof headingMatch.index !== 'number') {
		return null;
	}
	const remainder = changelog.slice(headingMatch.index);
	const boundaryMatch = remainder.match(changelogBoundaryRegExp);
	const entryEnd =
		typeof boundaryMatch?.index === 'number' ? boundaryMatch.index : remainder.length;
	return { index: headingMatch.index, text: remainder.slice(0, entryEnd) };
}

export async function getIncludedPRs(
	fromVersion: string,
	toVersion: string,
	repo: Repo,
	currentBranch: string | null,
	isPreRelease: boolean
): Promise<IncludedPR[]> {
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
	const prs: { pr: number; text: string }[] = [];
	let match: RegExpExecArray | null;
	while ((match = getPrRegExp.exec(commits))) {
		prs.push({ pr: Number(match[2]), text: match[1].split('\n')[0] });
	}

	// We only have a branch when locally preparing a release, otherwise we use the sha to find the PR
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
			const otherAuthors = new Set(
				commits.map(({ author, commit }) => author?.login || commit.author.name)
			);
			otherAuthors.delete(mainAuthor);
			const bodyWithoutComments = (pullRequest.body ?? '').replace(/<!--[\S\s]*?-->/g, '');
			const closedIssuesRegexp = /([Ff]ix(es|ed)?|([Cc]lose|[Rr]esolve)[ds]?) #(\d+)/g;
			const closed: number[] = [];
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

export async function getGithubApi(): Promise<GitHub> {
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

export function getGitTag(version: string): string {
	return `v${version}`;
}

export function getCurrentCommitMessage(): Promise<string> {
	return runAndGetStdout('git', ['--no-pager', 'log', '-1', '--pretty=%B']);
}
