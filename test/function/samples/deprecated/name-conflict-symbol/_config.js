const assert = require('assert');

module.exports = {
	description: 'avoids name conflicts with local variables named Symbol',
	options: {
		strictDeprecations: false,
		output: {
			namespaceToStringTag: true
		}
	},
	exports(exports) {
		assert.strictEqual(exports.Symbol, null);
		assert.strictEqual(exports.toString(), '[object Module]');
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.'
		}
	]
};
