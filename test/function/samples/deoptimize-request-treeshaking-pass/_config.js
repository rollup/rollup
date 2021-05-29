const assert = require('assert');
const result = { value: 0 };

module.exports = {
	description: 'makes sure to request additional passes when a variable is deoptimized',
	context: { result },
	exports() {
		assert.strictEqual(result.value, 2);
	}
};
