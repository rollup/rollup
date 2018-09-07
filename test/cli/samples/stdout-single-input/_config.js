const assert = require('assert');

module.exports = {
	description: 'bundles a single input to stdout without modifications',
	command: 'rollup -i main.js -f es',
	result(code) {
		assert.equal(code, 'console.log( 42 );\n');
	}
};
