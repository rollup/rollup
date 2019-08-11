const assert = require('assert');

module.exports = {
	description: 'imports from pure external modules that are used should not be omitted',
	options: {
		external: ['warning'],
		treeshake: {
			moduleSideEffects: 'no-external'
		}
	},
	context: {
		require: id => {
			if (id === 'warning') return arg => assert.equal(arg, 'hi');
			throw new Error('Unexpected import', id);
		}
	}
};
