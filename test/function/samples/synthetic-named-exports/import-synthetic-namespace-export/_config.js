const assert = require('assert');

module.exports = {
	description:
		'importing the synthetic namespace export returns a property on that export for string values',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (id.endsWith('true.js')) {
						return { code, syntheticNamedExports: true };
					}
					if (id.endsWith('default.js')) {
						return { code, syntheticNamedExports: 'default' };
					}
					if (id.endsWith('other.js')) {
						return { code, syntheticNamedExports: 'other' };
					}
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			defaultString: 'synthetic',
			other: 'synthetic',
			defaultTrue: { default: 'synthetic' }
		});
	}
};
