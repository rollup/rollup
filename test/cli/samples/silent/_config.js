const assert = require('assert');

module.exports = {
	description: 'does not print warnings with --silent',
	command: 'rollup -i main.js -f cjs --silent',
	stderr: stderr => {
		assert.equal(stderr, '');
		return true;
	}
};
