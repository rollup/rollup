const assert = require('assert');

module.exports = defineTest({
	description: 'allows to throw object expressions with all properties',
	exports({ test }) {
		try {
			test();
		} catch (error) {
			assert.deepStrictEqual(error, { my: 'info' });
		}
	}
});
