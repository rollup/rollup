// https://datatracker.ietf.org/doc/html/rfc2396
// eslint-disable-next-line no-control-regex
const INVALID_CHAR_RE = /[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g;

export function sanitizeFileName(name: string): string {
	const match = /^[a-z]:/i.exec(name);
	const driveLetter = match ? match[0] : '';

	// A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
	// Otherwise, avoid them because they can refer to NTFS alternate data streams.
	return driveLetter + name.substr(driveLetter.length).replace(INVALID_CHAR_RE, '_');
}
