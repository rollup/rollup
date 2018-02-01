import ansiEscape from 'ansi-escapes';
import { stderr } from '../logging';

const SHOW_ALTERNATE_SCREEN = '\u001B[?1049h';
const HIDE_ALTERNATE_SCREEN = '\u001B[?1049l';

const isWindows = process.platform === 'win32';
const isMintty = isWindows && !!(process.env.SHELL || process.env.TERM);
const isConEmuAnsiOn = (process.env.ConEmuANSI || '').toLowerCase() === 'on';
const supportsAnsi = !isWindows || isMintty || isConEmuAnsiOn;

export default function alternateScreen (enabled: boolean) {
	if (!enabled) {
		let needAnnounce = true;
		return {
			open () { },
			close () { },
			reset (heading: string) {
				if (needAnnounce) {
					stderr(heading);
					needAnnounce = false;
				}
			}
		};
	}

	return {
		open () {
			if (supportsAnsi) {
				process.stderr.write(SHOW_ALTERNATE_SCREEN);
			}
		},
		close () {
			if (supportsAnsi) {
				process.stderr.write(HIDE_ALTERNATE_SCREEN);
			}
		},
		reset (heading: string) {
			stderr(`${ansiEscape.eraseScreen}${ansiEscape.cursorTo(0, 0)}${heading}`);
		}
	};
}
