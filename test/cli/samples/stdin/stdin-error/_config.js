const { assertStderrIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'handles stdin errors',
	command: `node wrapper.js`,
	error(err) {
		assertStderrIncludes(err.message, 'Could not load -: Stream is broken.');
	}
};
