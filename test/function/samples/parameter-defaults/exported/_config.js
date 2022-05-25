const assert = require('assert');

module.exports = {
	description: 'includes default parameters for exported functions',
	exports({ funDecl, funExp, arrow }) {
		assert.strictEqual(funDecl(), 'defaultValue', 'function declaration');
		assert.strictEqual(funExp(), 'defaultValue', 'function expression');
		assert.strictEqual(arrow(), 'defaultValue', 'arrow function');
	}
};
