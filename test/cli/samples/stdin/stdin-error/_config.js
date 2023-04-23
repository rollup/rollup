const { assertIncludes } = require('../../../../utils.js');

module.exports = defineRollupTest({
	description: 'handles stdin errors',
	command: `node wrapper.js`,
	error(error) {
		assertIncludes(error.message, 'Could not load -: Stream is broken.');
	}
});
