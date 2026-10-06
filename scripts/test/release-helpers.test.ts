import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { getPreviousReleaseTag } from '../release-helpers.ts';
import type { Workspace } from './fixtures.ts';
import { withWorkspace } from './fixtures.ts';

describe('getPreviousReleaseTag', () => {
	it('picks the semantically highest strict release tag even when it differs from the alphabetical maximum', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			workspace.gitInWorkspace(['tag', 'v4.100.0']);
			process.chdir(workspace.repoPath);
			assert.equal(await getPreviousReleaseTag(), 'v4.100.0');
		});
	});

	it('picks the semantically highest tag comparing semver, not lexicographically', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			workspace.gitInWorkspace(['tag', 'v4.10.0']);
			process.chdir(workspace.repoPath);
			assert.equal(await getPreviousReleaseTag(), 'v4.10.0');
		});
	});

	it('excludes the given tag', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			process.chdir(workspace.repoPath);
			assert.equal(await getPreviousReleaseTag('v4.9.0'), 'v4.8.0');
		});
	});

	it('ignores pre-release tags', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			workspace.gitInWorkspace(['tag', 'v4.9.1-0']);
			process.chdir(workspace.repoPath);
			assert.equal(await getPreviousReleaseTag(), 'v4.9.0');
		});
	});

	it('ignores release tags on side branches that are not ancestors of HEAD', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			workspace.gitInWorkspace(['checkout', '-b', 'side-branch']);
			workspace.gitInWorkspace(['commit', '--allow-empty', '-m', 'A side branch commit']);
			workspace.gitInWorkspace(['tag', 'v9.9.9']);
			workspace.gitInWorkspace(['checkout', 'master']);
			process.chdir(workspace.repoPath);
			assert.equal(await getPreviousReleaseTag(), 'v4.9.0');
		});
	});

	it('throws when no strict release tag is among the ancestors of HEAD', async () => {
		await withWorkspace({}, async (workspace: Workspace) => {
			workspace.gitInWorkspace(['tag', '-d', 'v4.8.0']);
			workspace.gitInWorkspace(['tag', '-d', 'v4.9.0']);
			process.chdir(workspace.repoPath);
			await assert.rejects(
				async () => getPreviousReleaseTag(),
				/Could not find any previous release tag/u
			);
		});
	});
});
