const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'abort stdin with error',
	command: `./wrapper.js`,
	error(err) {
		assertStderrIncludes(err.message, 'Could not load -: Stream is broken.');
	}
};
