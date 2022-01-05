import Module from '../Module';

function guessIndentString(code: string): string | null {
	const lines = code.split('\n');

	const tabbed = lines.filter(line => /^\t+/.test(line));
	const spaced = lines.filter(line => /^ {2,}/.test(line));

	if (tabbed.length === 0 && spaced.length === 0) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if (tabbed.length >= spaced.length) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	const min = spaced.reduce((previous, current) => {
		const numSpaces = /^ +/.exec(current)![0].length;
		return Math.min(numSpaces, previous);
	}, Infinity);

	return new Array(min + 1).join(' ');
}

export default function getIndentString(
	modules: readonly Module[],
	options: { indent: true | string }
): string {
	if (options.indent !== true) return options.indent;
	for (const module of modules) {
		const indent = guessIndentString(module.originalCode);
		if (indent !== null) return indent;
	}

	return '\t';
}
