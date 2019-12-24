export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
export const relativePath = /^\.?\.\//;

export function isAbsolute(path: string) {
	return absolutePath.test(path);
}

export function isRelative(path: string) {
	return relativePath.test(path);
}

export function normalize(path: string) {
	return path.replace(/\\/g, '/');
}

export function basename(path: string) {
	return path.split(/(\/|\\)/).pop();
}

export function dirname(path: string) {
	const match = /(\/|\\)[^/\\]*$/.exec(path);
	if (!match) return '.';

	const dir = path.slice(0, -match[0].length);

	// If `dir` is the empty string, we're at root.
	return dir ? dir : '/';
}

export function extname(path: string) {
	const match = /\.[^.]+$/.exec(basename(path)!);
	if (!match) return '';
	return match[0];
}

export function relative(from: string, to: string) {
	const fromParts = from.split(/[/\\]/).filter(Boolean);
	const toParts = to.split(/[/\\]/).filter(Boolean);

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

export function resolve(...paths: string[]) {
	let resolvedParts = paths.shift()!.split(/[/\\]/);

	paths.forEach(path => {
		if (isAbsolute(path)) {
			resolvedParts = path.split(/[/\\]/);
		} else {
			const parts = path.split(/[/\\]/);

			while (parts[0] === '.' || parts[0] === '..') {
				const part = parts.shift();
				if (part === '..') {
					resolvedParts.pop();
				}
			}

			resolvedParts.push.apply(resolvedParts, parts);
		}
	});

	return resolvedParts.join('/');
}
