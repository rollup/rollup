const assert = require('assert');

module.exports = {
	description:
		'adds Symbol.toStringTag property to dynamic imports of entry chunks with default export mode',
	options: {
		strictDeprecations: false,
		input: ['main', 'foo'],
		output: {
			namespaceToStringTag: true
		}
	},
	async exports(exports) {
		const foo = await exports;
		assert.strictEqual(foo[Symbol.toStringTag], 'Module');
		assert.strictEqual(Object.prototype.toString.call(foo), '[object Module]');
		assert.strictEqual(foo.default, 42);
	}
};
