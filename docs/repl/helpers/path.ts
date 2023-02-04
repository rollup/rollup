export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[/\\|])/;
export const relativePath = /^\.?\.\//;

export function isAbsolute(path: string) {
	return absolutePath.test(path);
}

export function isRelative(path: string) {
	return relativePath.test(path);
}

export function basename(path: string) {
	return path.split(/(\/|\\)/).pop();
}

export function dirname(path: string) {
	const match = /([/\\])[^/\\]*$/.exec(path);
	if (!match) return '.';

	const directory = path.slice(0, -match[0].length);

	// If `dir` is the empty string, we're at root.
	return directory || '/';
}

export function extname(path: string) {
	const match = /\.[^.]+$/.exec(basename(path)!);
	if (!match) return '';
	return match[0];
}

export function relative(from: string, to: string) {
	const fromParts = from.split(/[/\\]/).filter(Boolean);
	const toParts = to.split(/[/\\]/).filter(Boolean);

	while (fromParts[0] && toParts[0] && fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}

	while (toParts[0] === '.' || toParts[0] === '..') {
		const toPart = toParts.shift();
		if (toPart === '..') {
			fromParts.pop();
		}
	}

	while (fromParts.pop()) {
		toParts.unshift('..');
	}

	return toParts.join('/');
}

const ANY_SLASH_REGEX = /[/\\]/;
const TRAILING_SLASH_REGEX = /[/\\]$/;

export function resolve(...paths: string[]) {
	let resolvedParts = paths.shift()!.replace(TRAILING_SLASH_REGEX, '').split(ANY_SLASH_REGEX);
	for (const path of paths) {
		const parts = path.replace(TRAILING_SLASH_REGEX, '').split(ANY_SLASH_REGEX);
		if (isAbsolute(path)) {
			resolvedParts = parts;
		} else {
			while (parts[0] === '.' || parts[0] === '..') {
				const part = parts.shift();
				if (part === '..') {
					resolvedParts.pop();
				}
			}
			resolvedParts.push(...parts);
		}
	}

	return resolvedParts.join('/');
}
