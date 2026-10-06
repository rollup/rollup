import esmock from 'esmock';
import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type { Workspace } from './fixtures.ts';
import {
	CANNED_CHANGELOG,
	CANNED_CHANGELOG_BODY,
	captureConsoleLogs,
	createGithubApiMocks,
	createInquirerMocks,
	DEFAULT_CHANGELOG,
	DEFAULT_CHANGELOG_BODY,
	withWorkspace
} from './fixtures.ts';

const UNRELEASED_COMMITS = ['Fix a bug (#101)', 'Add a feature (#102)'];

const EXPECTED_PR_SECTION = `### Pull Requests

- [#101](https://github.com/rollup/rollup/pull/101): Fix a bug (@pr-author-101, @Fallback Author)
- [#102](https://github.com/rollup/rollup/pull/102): Add a feature (@pr-author-102)`;

const HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Handwritten, never automatically updated text.`;

const HAND_EDITED_ENTRY_BEFORE_STALE_PULL_REQUESTS = `${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}

### Pull Requests

- [#101](https://github.com/rollup/rollup/pull/101): Fix a bug (@stale-author)`;

const HAND_EDITED_ENTRY_WITH_FOLLOWING_SECTION = `${HAND_EDITED_ENTRY_BEFORE_STALE_PULL_REQUESTS}

### Something Custom

- Handwritten, never automatically updated note.`;

function releaseDate(): string {
	return new Date().toISOString().slice(0, 10);
}

function createNewEntryStub(): string {
	return `## 4.9.1\n\n_${releaseDate()}_\n\n### Bug Fixes\n\n- [replace me] (#101)\n\n${EXPECTED_PR_SECTION}`;
}

// Mock injection uses the absolute-path two-step esmock form on purpose: esmock's
// global-mock argument makes node's type stripping reject the copied .ts scripts.
async function importPrepareRelease(workspace: Workspace): Promise<void> {
	const releaseHelpersModule = await esmock(
		workspace.scriptPath('release-helpers.ts'),
		createGithubApiMocks(workspace.githubState)
	);
	await esmock(workspace.scriptPath('prepare-release.ts'), {
		...createInquirerMocks(workspace.selectAnswers, workspace.selectCalls),
		[workspace.scriptPath('release-helpers.ts')]: releaseHelpersModule
	});
}

function usePullRequestFixtures(workspace: Workspace): void {
	workspace.githubState.pullRequests.set(101, { body: null, user: { login: 'pr-author-101' } });
	workspace.githubState.pullRequests.set(102, {
		body: 'Add a feature',
		user: { login: 'pr-author-102' }
	});
	workspace.githubState.pullRequestCommits.set(101, [
		{ author: null, commit: { author: { name: 'Fallback Author' } } }
	]);
	workspace.githubState.pullRequestCommits.set(102, [
		{ author: { login: 'pr-author-102' }, commit: { author: { name: 'commit-author-102' } } }
	]);
}

async function assertPreparedRelease(workspace: Workspace): Promise<void> {
	assert.equal(JSON.parse(await workspace.readFileInWorkspace('package.json')).version, '4.9.1');
	assert.equal(
		JSON.parse(await workspace.readFileInWorkspace('browser/package.json')).version,
		'4.9.1'
	);
	const lockfile = JSON.parse(await workspace.readFileInWorkspace('package-lock.json'));
	assert.equal(lockfile.version, '4.9.1');
	assert.equal(lockfile.packages[''].version, '4.9.1');
	assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('master'));
	assert.equal(workspace.workspaceRef('v4.9.1'), workspace.originRef('v4.9.1'));
	assert.equal(workspace.gitInWorkspace(['show', '-s', '--format=%s', 'HEAD']), '4.9.1');
}

describe('prepare-release', () => {
	it('creates, commits and pushes a patch release with a changelog stub after the changelog title', async () => {
		await withWorkspace(
			{ changelog: '# rollup changelog\n\n', commits: UNRELEASED_COMMITS },
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.deepEqual(await workspace.readNpmLog(), [
					`${workspace.repoPath} ci --ignore-scripts`,
					`${workspace.repoPath} run check-audit`,
					`${workspace.repoPath} run ci:lint`,
					`${workspace.repoPath} prettier --write CHANGELOG.md`,
					`${workspace.repoPath} prettier --write CHANGELOG.md`
				]);
				assert.equal(workspace.selectCalls.length, 2);
				assert.deepEqual(workspace.selectCalls[0]?.values, ['4.9.1', '4.10.0']);
				assert.match(workspace.selectCalls[1]?.message ?? '', /Please edit the changelog/u);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`# rollup changelog\n\n${createNewEntryStub()}\n\n`
				);
			}
		);
	});

	it('creates a patch release from a changelog with a single entry followed by a links block', async () => {
		await withWorkspace(
			{ changelog: CANNED_CHANGELOG, commits: UNRELEASED_COMMITS },
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`# rollup changelog\n\n${createNewEntryStub()}\n\n${CANNED_CHANGELOG_BODY}`
				);
				assert.notEqual(await workspace.readFileInWorkspace('CHANGELOG.md'), DEFAULT_CHANGELOG);
			}
		);
	});

	it('derives the previous release from tags rather than changelog entries', async () => {
		await withWorkspace(
			{
				changelog: '## 4.8.0\n\n__2024-11-30__\n\n### Bug Fixes\n\n- Old fix (#98)\n',
				commits: UNRELEASED_COMMITS
			},
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${createNewEntryStub()}\n\n## 4.8.0\n\n__2024-11-30__\n\n### Bug Fixes\n\n- Old fix (#98)\n`
				);
			}
		);
	});

	it('uses only strict release tags as the previous release when a pre-release tag is among the ancestors', async () => {
		await withWorkspace(
			{
				preTaggedCommits: [
					{ message: 'Fix a bug (#101)' },
					{ message: 'A tagged build commit', tag: 'v4.9.1-0' },
					{ message: 'Add a feature (#102)' }
				]
			},
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`# rollup changelog\n\n${createNewEntryStub()}\n\n${DEFAULT_CHANGELOG_BODY}`
				);
				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('package.json')).version,
					'4.9.1'
				);
			}
		);
	});

	it('appends a generated pull request section to an existing entry without one', async () => {
		await withWorkspace(
			{
				changelog: `${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${DEFAULT_CHANGELOG_BODY}`,
				commits: UNRELEASED_COMMITS
			},
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await captureConsoleLogs(async () => importPrepareRelease(workspace));

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${EXPECTED_PR_SECTION}\n\n${DEFAULT_CHANGELOG_BODY}`
				);
			}
		);
	});

	it('replaces a stale pull request section of a hand-edited entry in place', async () => {
		await withWorkspace(
			{
				changelog: `${HAND_EDITED_ENTRY_BEFORE_STALE_PULL_REQUESTS}\n\n${DEFAULT_CHANGELOG_BODY}`,
				commits: UNRELEASED_COMMITS
			},
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${EXPECTED_PR_SECTION}\n\n${DEFAULT_CHANGELOG_BODY}`
				);
			}
		);
	});

	it('preserves a section following the pull request section when regenerating', async () => {
		await withWorkspace(
			{
				changelog: `${HAND_EDITED_ENTRY_WITH_FOLLOWING_SECTION}\n\n${DEFAULT_CHANGELOG_BODY}`,
				commits: UNRELEASED_COMMITS
			},
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${EXPECTED_PR_SECTION}\n\n### Something Custom\n\n- Handwritten, never automatically updated note.\n\n${DEFAULT_CHANGELOG_BODY}`
				);
			}
		);
	});

	it('appends a generated pull request section cleanly to an entry at the end of the file', async () => {
		await withWorkspace(
			{ changelog: `${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n`, commits: UNRELEASED_COMMITS },
			async workspace => {
				usePullRequestFixtures(workspace);
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				await assertPreparedRelease(workspace);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${EXPECTED_PR_SECTION}\n`
				);
			}
		);
	});

	it('leaves an existing entry untouched when re-running produces no pull requests', async () => {
		await withWorkspace(
			{ changelog: `${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${DEFAULT_CHANGELOG_BODY}` },
			async workspace => {
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				const consoleLogs = await captureConsoleLogs(async () => importPrepareRelease(workspace));

				assert.equal(consoleLogs.join('\n').includes('was left unchanged'), true);
				assert.equal(
					await workspace.readFileInWorkspace('CHANGELOG.md'),
					`${HAND_EDITED_ENTRY_WITHOUT_PULL_REQUESTS}\n\n${DEFAULT_CHANGELOG_BODY}`
				);
				await assertPreparedRelease(workspace);
			}
		);
	});

	it('creates a pre-release on a feature branch without touching the changelog', async () => {
		await withWorkspace(
			{ branch: 'feature-something', commits: UNRELEASED_COMMITS },
			async workspace => {
				workspace.githubState.openPullRequests.push({
					head: { sha: 'open-pr-sha' },
					number: 103,
					title: 'Add something on a branch (#103)'
				});
				workspace.selectAnswers.push('4.9.1-0');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				assert.deepEqual(workspace.githubState.listPullRequestsFilters, [
					{ head: 'rollup:feature-something', state: 'open' }
				]);

				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('package.json')).version,
					'4.9.1-0'
				);
				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('browser/package.json')).version,
					'4.9.1-0'
				);
				const lockfile = JSON.parse(await workspace.readFileInWorkspace('package-lock.json'));
				assert.equal(lockfile.version, '4.9.1-0');
				assert.equal(lockfile.packages[''].version, '4.9.1-0');

				assert.equal(await workspace.readFileInWorkspace('CHANGELOG.md'), DEFAULT_CHANGELOG);

				assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('v4.9.1-0'));
				assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('feature-something'));
				assert.equal(workspace.gitInWorkspace(['show', '-s', '--format=%s', 'HEAD']), '4.9.1-0');

				assert.deepEqual(await workspace.readNpmLog(), [
					`${workspace.repoPath} ci --ignore-scripts`,
					`${workspace.repoPath} run check-audit`,
					`${workspace.repoPath} run ci:lint`
				]);
				assert.equal(workspace.selectCalls.length, 1);
				assert.deepEqual(workspace.selectCalls[0]?.values, ['5.0.0-0', '4.10.0-0', '4.9.1-0']);
			}
		);
	});

	it('ignores an invalid changelog file when preparing a pre-release', async () => {
		await withWorkspace(
			{ branch: 'feature-something', changelog: 'Unparseable.\n', commits: UNRELEASED_COMMITS },
			async workspace => {
				workspace.selectAnswers.push('4.9.1-0');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				assert.equal(await workspace.readFileInWorkspace('CHANGELOG.md'), 'Unparseable.\n');
				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('package.json')).version,
					'4.9.1-0'
				);
				assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('v4.9.1-0'));
			}
		);
	});
});
