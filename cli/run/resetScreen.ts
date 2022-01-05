import { MergedRollupOptions } from '../../src/rollup/types';
import { stderr } from '../logging';

const CLEAR_SCREEN = '\u001Bc';

export function getResetScreen(
	configs: readonly MergedRollupOptions[],
	allowClearScreen: boolean | undefined
): (heading: string) => void {
	let clearScreen = allowClearScreen;
	for (const config of configs) {
		if (config.watch && config.watch.clearScreen === false) {
			clearScreen = false;
		}
	}
	if (clearScreen) {
		return (heading: string) => stderr(CLEAR_SCREEN + heading);
	}

	let firstRun = true;
	return (heading: string) => {
		if (firstRun) {
			stderr(heading);
			firstRun = false;
		}
	};
}
