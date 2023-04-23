const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not remove calls to props without value',
	exports({ callProp, callStaticProp }) {
		let hasError = false;
		try {
			callStaticProp();
		} catch {
			hasError = true;
		}
		assert.ok(hasError);
		hasError = false;
		try {
			callProp();
		} catch {
			hasError = true;
		}
		assert.ok(hasError);
	}
});
