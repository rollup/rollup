const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not use "arguments" as a placeholder variable for a default export',
	exports(exports) {
		assert.deepStrictEqual(exports, { foo: { __proto__: null, default: 42 } });
	}
});
