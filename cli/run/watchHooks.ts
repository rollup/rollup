import { execSync } from 'node:child_process';
import type { RollupWatchHooks } from '../../src/rollup/types';
import { bold, cyan } from '../../src/utils/colors';
import { stderr } from '../logging';

function extractWatchHooks(
	command: Record<string, any>
): Partial<Record<RollupWatchHooks, string>> {
	if (!Array.isArray(command.watch)) return {};

	return command.watch
		.filter(value => typeof value === 'object')
		.reduce((acc, keyValueOption) => ({ ...acc, ...keyValueOption }), {});
}

export function createWatchHooks(command: Record<string, any>): (hook: RollupWatchHooks) => void {
	const watchHooks = extractWatchHooks(command);

	return function (hook: RollupWatchHooks): void {
		if (watchHooks[hook]) {
			const cmd = watchHooks[hook]!;

			if (!command.silent) {
				stderr(cyan(`watch.${hook} ${bold(`$ ${cmd}`)}`));
			}

			try {
				// !! important - use stderr for all writes from execSync
				const stdio = [process.stdin, process.stderr, process.stderr];
				execSync(cmd, { stdio: command.silent ? 'ignore' : stdio });
			} catch (e) {
				stderr((e as Error).message);
			}
		}
	};
}
