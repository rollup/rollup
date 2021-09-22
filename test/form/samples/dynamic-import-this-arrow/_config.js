const assert = require('assert');

module.exports = {
	description: 'uses correct "this" in dynamic imports when using arrow functions',
	options: {
		external: ['input', 'output'],
		output: {
			generatedCode: { arrowFunctions: true },
			name: 'bundle'
		}
	}
};
