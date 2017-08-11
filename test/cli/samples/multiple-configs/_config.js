const assert = require('assert');

module.exports = {
	description: 'generates output file when multiple configurations are specified and one build fails',
	command: 'rollup -c',
	error: err => {
		assert.ok(/Unexpected Exception/.test(err.message));
		return true;
	}
};
