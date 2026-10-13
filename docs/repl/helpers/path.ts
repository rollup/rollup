// The REPL stores module names exactly as entered and looks them up unchanged,
// so redundant inner path segments like the double slash in "dir//main.js" must
// survive resolution. That is why resolve does not delegate to
// browser/src/path, which collapses such segments.
const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Za-z]:)?[/\\|])/;

function isAbsolute(path: string) {
	return ABSOLUTE_PATH_REGEX.test(path);
}

export function dirname(path: string) {
	const match = /([/\\])[^/\\]*$/.exec(path);
	if (!match) return '.';

	const directory = path.slice(0, -match[0].length);

	// If `dir` is the empty string, we're at root.
	return directory || '/';
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
