const assert = require('assert');

module.exports = {
	description:
		'correctly imports dynamic namespaces with only a default export from entry- and non-entry-point chunks',
	options: {
		input: ['main', 'entry']
	},
	exports(exports) {
		return exports.then(result =>
			assert.deepStrictEqual(result, [{ default: 42 }, { default: 42 }])
		);
	}
};
