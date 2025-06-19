const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'handles stdin errors',
	spawnScript: 'wrapper.js',
	spawnArgs: [],
	error(error) {
		assertIncludes(error.message, 'Could not load -: Stream is broken.');
	}
});
