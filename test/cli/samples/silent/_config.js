const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not print warnings with --silent',
	command: 'rollup -i main.js -f cjs --silent',
	stderr: stderr => {
		assert.equal(stderr, '');
		return true;
	}
});
