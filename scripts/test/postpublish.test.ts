import esmock from 'esmock';
import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import {
	createGithubApiMocks,
	ENTRY_4_8_0,
	ENTRY_4_9_0,
	type FakeGitHubState,
	withWorkspace,
	type Workspace
} from './fixtures.ts';

const RELEASE_CHANGELOG = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Fix a bit (#101)

### Features

- Add another thing (#102)

${ENTRY_4_9_0}

${ENTRY_4_8_0}
`;

const RELEASE_BODY_4_9_1 = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Fix a bit (#101)

### Features

- Add another thing (#102)`;

function useReleaseEnvironment(): () => void {
	const savedEnvironment = {
		CI: process.env.CI,
		GITHUB_TOKEN: process.env.GITHUB_TOKEN,
		ROLLUP_RELEASE: process.env.ROLLUP_RELEASE
	};
	process.env.CI = 'true';
	process.env.GITHUB_TOKEN = 'dummy-token';
	process.env.ROLLUP_RELEASE = 'releasing';
	return () => {
		for (const environmentVariable of ['CI', 'GITHUB_TOKEN', 'ROLLUP_RELEASE'] as const) {
			if (savedEnvironment[environmentVariable] === undefined) {
				delete process.env[environmentVariable];
			} else {
				process.env[environmentVariable] = savedEnvironment[environmentVariable];
			}
		}
	};
}

async function importPostpublish(
	workspace: Workspace,
	githubState: FakeGitHubState
): Promise<void> {
	await esmock(workspace.scriptPath('postpublish.ts'), createGithubApiMocks(githubState));
}

describe('postpublish', () => {
	it('creates a GitHub release and release comments for a regular release', async () => {
		await withWorkspace(
			{
				commits: ['Fix a bug (#101)', 'Add a feature (#102)'],
				releases: [{ changelog: RELEASE_CHANGELOG, version: '4.9.1' }]
			},
			async workspace => {
				workspace.githubState.pullRequests.set(101, {
					body: 'Fixes #201.',
					user: { login: 'pr-author-101' }
				});
				workspace.githubState.pullRequests.set(102, {
					body: 'Closes #202.',
					user: { login: 'pr-author-102' }
				});

				process.chdir(workspace.repoPath);
				const restoreEnvironment = useReleaseEnvironment();
				try {
					await importPostpublish(workspace, workspace.githubState);
				} finally {
					restoreEnvironment();
				}

				assert.deepEqual(workspace.githubState.createdReleases, [
					{ body: RELEASE_BODY_4_9_1, name: 'v4.9.1', tag_name: 'v4.9.1' }
				]);
				assert.deepEqual(workspace.githubState.createdIssues, [
					{
						comment:
							'This PR has been released as part of rollup@4.9.1. You can test it via `npm install rollup`.',
						issueNumber: 101
					},
					{
						comment:
							'This issue has been resolved via #101 as part of rollup@4.9.1. You can test it via `npm install rollup`.',
						issueNumber: 201
					},
					{
						comment:
							'This PR has been released as part of rollup@4.9.1. You can test it via `npm install rollup`.',
						issueNumber: 102
					},
					{
						comment:
							'This issue has been resolved via #102 as part of rollup@4.9.1. You can test it via `npm install rollup`.',
						issueNumber: 202
					}
				]);
				assert.equal(workspace.originBranchExists('documentation-published'), true);
				assert.equal(workspace.originRef('documentation-published'), workspace.originRef('v4.9.1'));
			}
		);
	});

	it('comments with a pre-release note but creates no release or documentation branch for a pre-release', async () => {
		await withWorkspace(
			{
				releases: [
					{ changelog: RELEASE_CHANGELOG, version: '4.9.1' },
					{ changelog: RELEASE_CHANGELOG, version: '4.9.1-1' }
				]
			},
			async workspace => {
				workspace.githubState.openPullRequests.push({
					head: { sha: workspace.workspaceRef('HEAD') },
					number: 104,
					title: 'Add more things (#104)'
				});

				process.chdir(workspace.repoPath);
				const restoreEnvironment = useReleaseEnvironment();
				try {
					await importPostpublish(workspace, workspace.githubState);
				} finally {
					restoreEnvironment();
				}

				assert.deepEqual(workspace.githubState.createdReleases, []);
				assert.deepEqual(workspace.githubState.createdIssues, [
					{
						comment:
							'This PR has been released as part of rollup@4.9.1-1. Note that this is a pre-release, so to test it, you need to install Rollup via `npm install rollup@4.9.1-1` or `npm install rollup@beta`. It will likely become part of a regular release later.',
						issueNumber: 104
					}
				]);
				assert.equal(workspace.originBranchExists('documentation-published'), false);
			}
		);
	});
});
