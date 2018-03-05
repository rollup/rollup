const assert = require('assert');

module.exports = {
	description: 're-exports * from external module (#791)',
	options: {
		external: ['external'],
		output: { name: 'myBundle' }
	}
};
