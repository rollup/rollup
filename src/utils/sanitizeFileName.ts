// https://datatracker.ietf.org/doc/html/rfc2396
// eslint-disable-next-line no-control-regex
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$%&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

export function sanitizeFileName(name: string): string {
	const match = DRIVE_LETTER_REGEX.exec(name);
	const driveLetter = match ? match[0] : '';

	// A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
	// Otherwise, avoid them because they can refer to NTFS alternate data streams.
	return driveLetter + name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '_');
}
