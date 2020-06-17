const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'handles stdin errors',
	command: `node wrapper.js`,
	error(err) {
		assertIncludes(err.message, 'Could not load -: Stream is broken.');
	}
};
