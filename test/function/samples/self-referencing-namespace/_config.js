const assert = require('node:assert');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'supports dynamic namespaces that reference themselves',
	options: {
		output: { generatedCode: { constBindings: true } }
	},
	exports(exports) {
		assert.strictEqual(exports.foo, 'foo');
		assert.strictEqual(exports.ns.foo, 'foo');
		assert.strictEqual(exports.ns.ns.foo, 'foo');
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_MAIN],
			message: 'Circular dependency: main.js -> main.js'
		}
	]
});
