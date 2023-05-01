const assert = require('node:assert');
const result = { value: 0 };

module.exports = defineTest({
	description: 'makes sure to request additional passes when a variable is deoptimized',
	context: { result },
	exports() {
		assert.strictEqual(result.value, 2);
	}
});
