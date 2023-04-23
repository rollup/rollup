const assert = require('node:assert');
const { readFileSync, unlinkSync } = require('node:fs');

module.exports = defineTest({
	description: 'uses -o from CLI',
	command: 'rollup -c -o output.js',
	test() {
		const output = readFileSync('output.js', 'utf8');
		assert.equal(output.trim(), 'console.log(42);');
		unlinkSync('output.js');
	}
});
