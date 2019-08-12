import { stderr } from '../logging';

const CLEAR_SCREEN = '\u001Bc';

export function getResetScreen(clearScreen: boolean) {
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
