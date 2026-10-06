import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import {
	captureConsoleLogs,
	ENTRY_4_8_0,
	ENTRY_4_9_0,
	withWorkspace,
	type Workspace
} from './fixtures.ts';

const SINGLE_ENTRY_CHANGELOG = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Fix a bit (#101)

### Features

- Add another thing (#102)

For previous changelogs, please see the CHANGELOG-4.md file.
`;

const PLACEHOLDER_CHANGELOG = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Fix a bit [replace me] (#101)

${ENTRY_4_9_0}

${ENTRY_4_8_0}
`;

async function importPrepublish(workspace: Workspace): Promise<void> {
	process.chdir(workspace.repoPath);
	await import(workspace.scriptPath('prepublish.ts'));
}

describe('prepublish', () => {
	it('publishes browser and wasm-node packages before napi prepublish for a regular release', async () => {
		await withWorkspace(
			{ releases: [{ changelog: SINGLE_ENTRY_CHANGELOG, version: '4.9.1' }] },
			async workspace => {
				await captureConsoleLogs(async () => importPrepublish(workspace));

				assert.deepEqual(await workspace.readNpmLog(), [
					`${workspace.repoPath}/browser publish`,
					`${workspace.repoPath}/wasm-node-package publish`,
					`${workspace.repoPath} run prepublish:napi`
				]);

				assert.deepEqual(
					JSON.parse(await workspace.readFileInWorkspace('package.json')).optionalDependencies,
					{
						'@rollup-napi-darwin-arm64': '9.9.9',
						'@rollup/rollup-linux-x64-gnu': '4.9.1'
					}
				);
			}
		);
	});

	it('publishes a pre-release commit without reading the changelog', async () => {
		await withWorkspace({ changelog: 'Unparseable.\n', commits: ['4.9.1-1'] }, async workspace => {
			await captureConsoleLogs(async () => importPrepublish(workspace));

			assert.deepEqual((await workspace.readNpmLog()).slice(0, 2), [
				`${workspace.repoPath}/browser publish`,
				`${workspace.repoPath}/wasm-node-package publish`
			]);
			assert.equal(await workspace.readFileInWorkspace('CHANGELOG.md'), 'Unparseable.\n');
		});
	});

	it('fails without publishing anything when the changelog entry is missing for a regular release', async () => {
		await withWorkspace({ commits: ['4.9.2'] }, async workspace => {
			await assert.rejects(
				async () => importPrepublish(workspace),
				/There is no changelog entry for version "4\.9\.2"\./
			);
			assert.deepEqual(await workspace.readNpmLog(), []);
		});
	});

	it('fails without publishing anything when the changelog entry contains placeholders', async () => {
		await withWorkspace(
			{ changelog: PLACEHOLDER_CHANGELOG, commits: ['4.9.1'] },
			async workspace => {
				await assert.rejects(
					async () => importPrepublish(workspace),
					/The changelog entry must not contain placeholders/
				);
				assert.deepEqual(await workspace.readNpmLog(), []);
			}
		);
	});
});
