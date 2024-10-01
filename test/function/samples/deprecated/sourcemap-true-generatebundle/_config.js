const assert = require('node:assert');

module.exports = defineTest({
	description: 'emits sourcemaps before generateBundle hook',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				name: 'test',
				generateBundle(options, bundle) {
					assert.deepStrictEqual(Object.keys(bundle), ['main.js', 'main.js.map']);
					assert.strictEqual(
						bundle['main.js'].code,
						`'use strict';

var main = 42;

module.exports = main;
//# sourceMappingURL=main.js.map
`
					);
					assert.strictEqual(bundle['main.js.map'].name, undefined);
					assert.strictEqual(bundle['main.js.map'].originalFileName, null);
				}
			}
		],
		output: { sourcemap: true }
	}
});
