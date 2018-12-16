const assert = require('assert');

module.exports = {
	description: 'plugin .transformBundle gets passed options',
	options: {
		plugins: [
			{
				transformBundle(code, options) {
					assert.strictEqual(
						Object.keys(options).join(', '),
						require('../../../misc/optionList').output
					);
					return options.format;
				}
			}
		]
	}
};
