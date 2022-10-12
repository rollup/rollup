const assert = require('node:assert');

module.exports = {
	description: 'throws error if config does not export an object',
	command: 'rollup -c',
	error(error) {
		assert.ok(/Config file must export an options object/.test(error.message));
	}
};
