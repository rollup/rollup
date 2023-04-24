/**
 * @param {string} source
 * @param {string | number} search
 * @returns {{ line: number, column: number } | undefined}
 */
module.exports = function getLocation(source, search) {
	var lines = source.split('\n');
	var length_ = lines.length;

	var lineStart = 0;
	var index;

	const charIndex = typeof search === 'number' ? search : source.indexOf(search);

	for (index = 0; index < length_; index += 1) {
		var line = lines[index];
		var lineEnd = lineStart + line.length + 1; // +1 for newline

		if (lineEnd > charIndex) {
			return { line: index + 1, column: charIndex - lineStart };
		}

		lineStart = lineEnd;
	}

	throw new Error('Could not determine location of character');
};
