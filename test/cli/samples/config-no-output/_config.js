const fs = require('fs');
const assert = require('assert');

module.exports = {
	description: 'uses -o from CLI',
	command: 'rollup -c -o output.js',
	test() {
		const output = fs.readFileSync('output.js', 'utf-8');
		assert.equal(output.trim(), 'console.log(42);');
		fs.unlinkSync('output.js');
	}
};
