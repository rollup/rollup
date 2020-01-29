const assert = require('assert');

module.exports = {
	description: 'imports from pure external modules that are used should not be omitted',
	options: {
		strictDeprecations: false,
		external: ['warning'],
		treeshake: {
			pureExternalModules: ['warning']
		}
	},
	context: {
		require: id => {
			if (id === 'warning') return arg => assert.equal(arg, 'hi');
			throw new Error('Unexpected import', id);
		}
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message: `The "treeshake.pureExternalModules" option is deprecated. The "treeshake.moduleSideEffects" option should be used instead. "treeshake.pureExternalModules: true" is equivalent to "treeshake.moduleSideEffects: 'no-external'"`
		}
	]
};
