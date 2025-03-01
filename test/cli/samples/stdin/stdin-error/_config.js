const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'handles stdin errors',
	command: `node wrapper.js`,
	error(error) {
		assertIncludes(error.message, 'Could not load -: Stream is broken.');
	}
});
