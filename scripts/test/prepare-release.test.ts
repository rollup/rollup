import esmock from 'esmock';
import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type { Workspace } from './fixtures.ts';
import {
	createGithubApiMocks,
	createInquirerMocks,
	DEFAULT_CHANGELOG,
	ENTRY_4_9_0,
	withWorkspace
} from './fixtures.ts';

// The two-step mock injection via esmock (first esmocking release-helpers with a
// github-api mock, then injecting the mock module under its absolute path) is
// required because esmock's third-argument global mocks rewrite specifier URLs in
// a way that makes node's native type stripping refuse the copied .ts scripts.
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

describe('prepare-release', () => {
	it('creates, commits and pushes a patch release with a changelog stub on the main branch', async () => {
		await withWorkspace(
			{ commits: ['Fix a bug (#101)', 'Add a feature (#102)'] },
			async workspace => {
				workspace.githubState.pullRequests.set(101, {
					body: 'Fix a bug',
					user: { login: 'pr-author-101' }
				});
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
				workspace.selectAnswers.push('4.9.1', 'ok');
				process.chdir(workspace.repoPath);

				await importPrepareRelease(workspace);

				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('package.json')).version,
					'4.9.1'
				);
				assert.equal(
					JSON.parse(await workspace.readFileInWorkspace('browser/package.json')).version,
					'4.9.1'
				);
				const lockfile = JSON.parse(await workspace.readFileInWorkspace('package-lock.json'));
				assert.equal(lockfile.version, '4.9.1');
				assert.equal(lockfile.packages[''].version, '4.9.1');

				const changelog = await workspace.readFileInWorkspace('CHANGELOG.md');
				const baselineStartIndex = changelog.indexOf(`\n${ENTRY_4_9_0}`);
				assert.equal(changelog.slice(baselineStartIndex), `\n${DEFAULT_CHANGELOG}`);
				const newEntry = changelog.slice(0, baselineStartIndex);
				assert.match(newEntry, /### Bug Fixes/);
				assert.match(newEntry, /- \[replace me] \(#101\)/);
				assert.equal(/### Features/.test(newEntry), false);
				assert.match(newEntry, /### Pull Requests/);
				assert.match(
					newEntry,
					/- \[#101]\(https:\/\/github\.com\/rollup\/rollup\/pull\/101\): Fix a bug \(@pr-author-101, @Fallback Author\)/
				);
				assert.match(
					newEntry,
					/- \[#102]\(https:\/\/github\.com\/rollup\/rollup\/pull\/102\): Add a feature \(@pr-author-102\)/
				);
				assert.equal(newEntry.includes('#99'), false);

				assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('master'));
				assert.equal(workspace.workspaceRef('HEAD'), workspace.originRef('v4.9.1'));
				assert.equal(workspace.workspaceRef('v4.9.1'), workspace.originRef('v4.9.1'));
				assert.equal(workspace.gitInWorkspace(['show', '-s', '--format=%s', 'HEAD']), '4.9.1');

				assert.deepEqual(await workspace.readNpmLog(), [
					`${workspace.repoPath} ci --ignore-scripts`,
					`${workspace.repoPath} run check-audit`,
					`${workspace.repoPath} run ci:lint`,
					`${workspace.repoPath} prettier --write CHANGELOG.md`,
					`${workspace.repoPath} prettier --write CHANGELOG.md`
				]);
				assert.equal(workspace.selectCalls.length, 2);
				assert.deepEqual(workspace.selectCalls[0]?.values, ['4.9.1', '4.10.0']);
				assert.match(workspace.selectCalls[0]?.message ?? '', /Select type of release/u);
				assert.deepEqual(workspace.selectCalls[1]?.values, ['ok']);
				assert.match(workspace.selectCalls[1]?.message ?? '', /Please edit the changelog/u);
			}
		);
	});

	it('creates a pre-release on a feature branch without touching the changelog', async () => {
		await withWorkspace(
			{ branch: 'feature-something', commits: ['Fix a bug (#101)', 'Add a feature (#102)'] },
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
});
