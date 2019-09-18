const fs = require('fs');
const assert = require('assert');

module.exports = {
	description: 'adds a newline after the sourceMappingURL comment (#756)',
	command: 'rollup -i main.js -f es -m hidden -o output.js',
	test() {
		const output = fs.readFileSync('output.js', 'utf-8');
		assert.equal(output.trim(), 'console.log( 42 );');
		fs.unlinkSync('output.js');
		fs.unlinkSync('output.js.map');
	}
};
