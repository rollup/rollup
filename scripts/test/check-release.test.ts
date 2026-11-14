import esmock from 'esmock';
import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import path from 'node:path';
import { REPO_ROOT } from './fixtures.ts';

describe('check-release', () => {
	it('prints an error and exits with code 1 when not in release mode', async () => {
		let exitCode: number | undefined;
		const consoleErrors: string[] = [];
		const originalConsoleError = console.error;
		console.error = message => {
			consoleErrors.push(String(message));
		};
		try {
			await esmock(path.join(REPO_ROOT, 'scripts', 'check-release.ts'), {
				'node:process': {
					env: {},
					exit: (code: number) => {
						exitCode = code;
					}
				}
			});
		} finally {
			console.error = originalConsoleError;
		}
		assert.deepEqual(consoleErrors, ['Currently not in release mode.']);
		assert.equal(exitCode, 1);
	});

	it('completes without exiting when in release mode', async () => {
		let exitCalled = false;
		await esmock(path.join(REPO_ROOT, 'scripts', 'check-release.ts'), {
			'node:process': {
				env: { ROLLUP_RELEASE: 'releasing' },
				exit: () => {
					exitCalled = true;
				}
			}
		});
		assert.equal(exitCalled, false);
	});
});
