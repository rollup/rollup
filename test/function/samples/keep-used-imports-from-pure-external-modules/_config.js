const assert = require('node:assert');

module.exports = defineTest({
	description: 'imports from pure external modules that are used should not be omitted',
	options: {
		external: ['warning'],
		treeshake: {
			moduleSideEffects: 'no-external'
		}
	},
	context: {
		require: id => {
			if (id === 'warning') return argument => assert.equal(argument, 'hi');
			throw new Error('Unexpected import', id);
		}
	}
});
