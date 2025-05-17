const assert = require('node:assert');

module.exports = defineTest({
	description:
		'generates output file when multiple configurations are specified and one build fails',
	spawnArgs: ['-c'],
	error: error => {
		assert.ok(/Unexpected Exception/.test(error.message));
		return true;
	}
});
