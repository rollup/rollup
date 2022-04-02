import { execSync } from 'child_process';
import type { MergedRollupOptions, RollupWatchHooks } from '../../src/rollup/types';
import { bold, cyan } from '../../src/utils/colors';
import { stderr } from '../logging';

export function runWatchHook(
	configs: readonly MergedRollupOptions[],
	hook: RollupWatchHooks,
	silent: boolean
): void {
	for (const config of configs) {
		if (config.watch && config.watch[hook]) {
			const cmd = config.watch[hook]!;

			if (!silent) {
				stderr(cyan(`watch:${hook} ${bold(`$ ${cmd}`)}`));
			}

			try {
				execSync(cmd, {
					stdio: silent ? 'ignore' : 'inherit'
				});
			} catch (e) {
				stderr((e as Error).message);
			}
		}
	}
}
