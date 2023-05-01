const assert = require('node:assert');

module.exports = defineTest({
	description: 'includes default parameters for exported functions',
	exports({ funDecl, funExp, arrow }) {
		assert.strictEqual(funDecl(), 'defaultValue', 'function declaration');
		assert.strictEqual(funExp(), 'defaultValue', 'function expression');
		assert.strictEqual(arrow(), 'defaultValue', 'arrow function');
	}
});
