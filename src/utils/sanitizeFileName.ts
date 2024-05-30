// https://datatracker.ietf.org/doc/html/rfc2396
// eslint-disable-next-line no-control-regex
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;
const PERCENT_REGEX = /%/g;

const decodeURIComponentSafe =
	typeof decodeURIComponent === 'undefined' ? undefined : decodeURIComponent;

export function sanitizeFileName(name: string): string {
	// A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
	// Otherwise, avoid them because they can refer to NTFS alternate data streams.
	const match = DRIVE_LETTER_REGEX.exec(name);
	const driveLetter = match ? match[0] : '';
	let path = name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '_');

	// Replace % with _ if there is invalid escape sequence
	if (path.includes('%')) {
		if (decodeURIComponentSafe) {
			try {
				decodeURIComponentSafe(path);
			} catch {
				path = path.replace(PERCENT_REGEX, '_');
			}
		} else {
			path = path.replace(PERCENT_REGEX, '_');
		}
	}

	return driveLetter + path;
}
