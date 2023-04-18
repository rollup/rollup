function spaces(index: number): string {
	let result = '';
	while (index--) result += ' ';
	return result;
}

function tabsToSpaces(value: string): string {
	return value.replace(/^\t+/, match => match.split('\t').join('  '));
}

const LINE_TRUNCATE_LENGTH = 120;
const MIN_CHARACTERS_SHOWN_AFTER_LOCATION = 10;
const ELLIPSIS = '...';

export default function getCodeFrame(source: string, line: number, column: number): string {
	let lines = source.split('\n');
	// Needed if a plugin did not generate correct sourcemaps
	if (line > lines.length) return '';
	const maxLineLength = Math.max(
		tabsToSpaces(lines[line - 1].slice(0, column)).length +
			MIN_CHARACTERS_SHOWN_AFTER_LOCATION +
			ELLIPSIS.length,
		LINE_TRUNCATE_LENGTH
	);

	const frameStart = Math.max(0, line - 3);
	let frameEnd = Math.min(line + 2, lines.length);

	lines = lines.slice(frameStart, frameEnd);
	while (!/\S/.test(lines[lines.length - 1])) {
		lines.pop();
		frameEnd -= 1;
	}

	const digits = String(frameEnd).length;

	return lines
		.map((sourceLine, index) => {
			const isErrorLine = frameStart + index + 1 === line;

			let lineNumber = String(index + frameStart + 1);
			while (lineNumber.length < digits) lineNumber = ` ${lineNumber}`;

			let displayedLine = tabsToSpaces(sourceLine);
			if (displayedLine.length > maxLineLength) {
				displayedLine = `${displayedLine.slice(0, maxLineLength - ELLIPSIS.length)}${ELLIPSIS}`;
			}
			if (isErrorLine) {
				const indicator =
					spaces(digits + 2 + tabsToSpaces(sourceLine.slice(0, column)).length) + '^';
				return `${lineNumber}: ${displayedLine}\n${indicator}`;
			}

			return `${lineNumber}: ${displayedLine}`;
		})
		.join('\n');
}
