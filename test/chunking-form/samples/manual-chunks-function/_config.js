const assert = require('node:assert');

module.exports = defineTest({
	description: 'allows to define manual chunks via a function',
	options: {
		input: ['main-a'],
		output: {
			manualChunks(id) {
				if (id[id.length - 5] === '-') {
					return `chunk-${id[id.length - 4]}`;
				}
			}
		},
		plugins: [
			{
				generateBundle(options, bundle) {
					assert.deepStrictEqual(Object.keys(bundle), [
						'main-a.js',
						'generated-dep1.js',
						'generated-dep2.js',
						'generated-chunk-c.js',
						'generated-chunk-b.js'
					]);
				}
			}
		]
	}
});
