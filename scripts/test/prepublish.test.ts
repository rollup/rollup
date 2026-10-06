import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { ENTRY_4_8_0, ENTRY_4_9_0, withWorkspace, type Workspace } from './fixtures.ts';

const RELEASE_CHANGELOG = `## 4.9.1

__2025-02-01__

### Bug Fixes

- Fix a bit (#101)

### Features

- Add another thing (#102)

${ENTRY_4_9_0}

${ENTRY_4_8_0}
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

async function captureConsoleLogs(run: () => Promise<void>): Promise<string[]> {
	const consoleLogs: string[] = [];
	const originalConsoleLog = console.log;
	console.log = (message: unknown): void => {
		consoleLogs.push(String(message));
	};
	try {
		await run();
	} finally {
		console.log = originalConsoleLog;
	}
	return consoleLogs;
}

describe('prepublish', () => {
	it('publishes browser and wasm-node packages before napi prepublish for a regular release', async () => {
		await withWorkspace(
			{ releases: [{ changelog: RELEASE_CHANGELOG, version: '4.9.1' }] },
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

	it('publishes a pre-release commit without a changelog entry', async () => {
		await withWorkspace({ commits: ['4.9.1-1'] }, async workspace => {
			const consoleLogs = await captureConsoleLogs(async () => importPrepublish(workspace));

			assert.match(
				consoleLogs.join('\n'),
				/no changelog entry for version "4\.9\.1-1", the last entry is for version "4\.9\.0"\. This is OK for a pre-release\./
			);
			assert.deepEqual((await workspace.readNpmLog()).slice(0, 2), [
				`${workspace.repoPath}/browser publish`,
				`${workspace.repoPath}/wasm-node-package publish`
			]);
		});
	});

	it('fails without publishing anything when the changelog entry is missing for a regular release', async () => {
		await withWorkspace({ commits: ['4.9.2'] }, async workspace => {
			await assert.rejects(
				async () => importPrepublish(workspace),
				/There is no changelog entry for version "4\.9\.2", the last entry is for version "4\.9\.0"\./
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
