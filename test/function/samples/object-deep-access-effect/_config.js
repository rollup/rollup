const assert = require('assert');

module.exports = {
	description: 'throws when an nested property of an unknown object property is accessed',
	context: {
		require() {
			return { unknown: 'prop' };
		}
	},
	options: {
		external: ['external']
	},
	exports({ expectError }) {
		assert.throws(expectError, {
			name: 'TypeError',
			message: "Cannot read property 'prop' of undefined"
		});
	}
};
