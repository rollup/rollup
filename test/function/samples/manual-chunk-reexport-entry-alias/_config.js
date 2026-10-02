const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'keeps the manual chunk for a re-export barrel that is also an entry even if the barrel itself is tree-shaken',
	options: {
		input: ['main.js', 'index.js'],
		output: {
			chunkFileNames: '[name].js',
			manualChunks(id) {
				if (id.endsWith('index.js')) {
					return 'barrel';
				}
			}
		}
	},
	code: codeMap =>
		assert.deepStrictEqual(Object.keys(codeMap).sort(), ['a.js', 'index.js', 'main.js'])
});
