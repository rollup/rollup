const assert = require('assert');

module.exports = {
	description: 'errors with custom (plugin generated) code frame',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => {
		assert.ok(/custom code frame/.test(stderr));
	}
};
