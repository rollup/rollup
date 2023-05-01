const assert = require('node:assert');

module.exports = defineTest({
	description: 'includes inline sourcemap comments in generateBundle hook',
	options: {
		plugins: [
			{
				name: 'test',
				generateBundle(options, bundle) {
					assert.deepStrictEqual(Object.keys(bundle), ['main.js']);
					assert.strictEqual(
						bundle['main.js'].code,
						`'use strict';

var main = 42;

module.exports = main;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCA0MjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFdBQWUsRUFBRTs7OzsifQ==
`
					);
				}
			}
		],
		output: { sourcemap: 'inline' }
	}
});
