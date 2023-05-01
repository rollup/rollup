const assert = require('node:assert');

module.exports = defineTest({
	description:
		'correctly imports dynamic namespaces with only a default export from entry- and non-entry-point chunks',
	options: {
		input: ['main', 'entry']
	},
	exports(exports) {
		return exports.then(result =>
			assert.deepStrictEqual(result, [{ __proto__: null, default: 42 }, { default: 42 }])
		);
	}
});
