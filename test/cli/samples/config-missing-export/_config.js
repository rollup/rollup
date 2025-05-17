const assert = require('node:assert');

module.exports = defineTest({
	description: 'throws error if config does not export an object',
	spawnArgs: ['-c'],
	error(error) {
		assert.ok(/Config file must export an options object/.test(error.message));
	}
});
