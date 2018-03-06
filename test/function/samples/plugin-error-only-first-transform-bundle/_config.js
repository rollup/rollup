var assert = require('assert');

module.exports = {
	description: 'throws error only with first plugin transformBundle',
	options: {
		plugins: [
			{
				name: 'plugin1',
				transformBundle: function() {
					throw Error('Something happened 1');
				}
			},
			{
				name: 'plugin2',
				transformBundle: function() {
					throw Error('Something happened 2');
				}
			}
		]
	},
	generateError: {
		code: 'BAD_BUNDLE_TRANSFORMER',
		plugin: 'plugin1',
		message: `Error transforming bundle with 'plugin1' plugin: Something happened 1`
	}
};
