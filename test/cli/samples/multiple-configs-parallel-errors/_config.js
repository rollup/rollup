const assert = require('assert');

module.exports = {
	description: 'fails for every build in multiple configuration',
	command: 'rollup -c',
	error: err => {
		assert.ok(/Exception 1/.test(err.message));
		assert.ok(/Exception 2/.test(err.message));
	}
};
