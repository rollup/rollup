const { readFileSync, unlinkSync } = require('fs');
const assert = require('node:assert');

module.exports = {
	description: 'uses -o from CLI',
	command: 'rollup -c -o output.js',
	test() {
		const output = readFileSync('output.js', 'utf-8');
		assert.equal(output.trim(), 'console.log(42);');
		unlinkSync('output.js');
	}
};
