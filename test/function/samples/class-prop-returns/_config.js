const assert = require('assert');

module.exports = {
	description: 'does not remove calls to props without value',
	minNodeVersion: 12,
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
};
