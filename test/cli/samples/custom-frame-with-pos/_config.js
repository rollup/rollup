const assert = require('assert');

module.exports = {
	description: 'custom (plugin generated) code frame taking priority over pos generated one',
	command: 'rollup -c',
	error: () => true,
	stderr: stderr => {
		assert.ok(/custom code frame/.test(stderr));
	}
};
