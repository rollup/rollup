const assert = require('assert');

module.exports = {
	description: 'throws error if config does not export an object',
	command: 'rollup -c',
	error(err) {
		assert.ok(/Config file must export an options object/.test(err.message));
	}
};
