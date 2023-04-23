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
					// This also asserts the sorting order, which should be alphabetical
					// between the manual chunks
					assert.deepStrictEqual(Object.keys(bundle), [
						'main-a.js',
						'generated-chunk-c.js',
						'generated-chunk-b.js'
					]);
				}
			}
		]
	}
});
