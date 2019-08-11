const assert = require('assert');

module.exports = {
	description: 'triggers onwarn with --silent',
	command: 'rollup -c --silent',
	stderr: stderr => {
		assert.equal(stderr, '');
		return true;
	}
};
