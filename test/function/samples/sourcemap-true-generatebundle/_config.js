const assert = require('node:assert');

module.exports = defineTest({
	description: 'emits sourcemaps before generateBundle hook',
	options: {
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
					assert.deepStrictEqual(bundle['main.js.map'], {
						fileName: 'main.js.map',
						name: undefined,
						needsCodeReference: false,
						originalFileName: null,
						source:
							'{"version":3,"file":"main.js","sources":["main.js"],"sourcesContent":["export default 42;\\n"],"names":[],"mappings":";;AAAA,WAAe,EAAE;;;;"}',
						type: 'asset'
					});
				}
			}
		],
		output: { sourcemap: true }
	}
});
