const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Za-z]:)?[/\\|])/;
const RELATIVE_PATH_REGEX = /^\.?\.\//;
const ALL_BACKSLASHES_REGEX = /\\/g;
const ANY_SLASH_REGEX = /[/\\]/;
const EXTNAME_REGEX = /\.[^.]+$/;

export function isAbsolute(path: string): boolean {
	return ABSOLUTE_PATH_REGEX.test(path);
}

export function isRelative(path: string): boolean {
	return RELATIVE_PATH_REGEX.test(path);
}

export function normalize(path: string): string {
	return path.replace(ALL_BACKSLASHES_REGEX, '/');
}

export function basename(path: string): string {
	return path.split(ANY_SLASH_REGEX).pop() || '';
}

export function dirname(path: string): string {
	const match = /[/\\][^/\\]*$/.exec(path);
	if (!match) return '.';

	const directory = path.slice(0, -match[0].length);

	// If `directory` is the empty string, we're at root.
	return directory || '/';
}

export function extname(path: string): string {
	const match = EXTNAME_REGEX.exec(basename(path)!);
	return match ? match[0] : '';
}

export function join(...segments: string[]): string {
	const joined = segments.join('/');
	const absolute = ANY_SLASH_REGEX.test(joined[0]);
	return (
		(absolute ? '/' : '') +
		(normalizePathSegments(joined.split(ANY_SLASH_REGEX), absolute) || (absolute ? '' : '.'))
	);
}

function normalizePathSegments(parts: string[], absolute = false): string {
	const normalized: string[] = [];
	for (const part of parts) {
		if (part === '..') {
			if (normalized.length > 0 && normalized[normalized.length - 1] !== '..') {
				normalized.pop();
			} else if (!absolute) {
				normalized.push('..');
			}
		} else if (part !== '.' && part !== '') {
			normalized.push(part);
		}
	}
	return normalized.join('/');
}

export function relative(from: string, to: string): string {
	const fromParts = from.split(ANY_SLASH_REGEX).filter(Boolean);
	const toParts = to.split(ANY_SLASH_REGEX).filter(Boolean);

	if (fromParts[0] === '.') fromParts.shift();
	if (toParts[0] === '.') toParts.shift();

	while (fromParts[0] && toParts[0] && fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}

	while (toParts[0] === '..' && fromParts.length > 0) {
		toParts.shift();
		fromParts.pop();
	}

	while (fromParts.pop()) {
		toParts.unshift('..');
	}

	return toParts.join('/');
}

export function resolve(...paths: string[]): string {
	let parts: string[] = [];
	let isAbsoluteResult = false;
	for (const path of paths) {
		if (isAbsolute(path)) {
			parts = path.split(ANY_SLASH_REGEX);
			isAbsoluteResult = true;
		} else {
			parts.push(...path.split(ANY_SLASH_REGEX));
		}
	}
	const normalized = normalizePathSegments(parts, isAbsoluteResult);
	if (!isAbsoluteResult) return normalized || '/';
	// Windows absolute paths (e.g. "C:/path") must not get a leading "/" prepended.
	// Unix absolute paths must start with "/".
	return /^[A-Za-z]:/.test(normalized) ? normalized : '/' + normalized;
}
