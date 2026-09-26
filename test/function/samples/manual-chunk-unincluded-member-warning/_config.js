const assert = require('node:assert/strict');

const WARNING_EMPTY_MANUAL_CHUNK = {
	code: 'EMPTY_MANUAL_CHUNK',
	level: 'warn',
	message:
		'Manual chunk "empty" was not generated as none of its modules are included in the bundle.',
	names: ['empty']
};

module.exports = defineTest({
	description:
		'warns for manual chunks whose members are all tree-shaken away while chunks with included members are still generated',
	logs: [WARNING_EMPTY_MANUAL_CHUNK],
	options: {
		output: {
			chunkFileNames: '[name].js',
			manualChunks(id) {
				if (id.endsWith('empty.js')) {
					return 'empty';
				}
				if (id.endsWith('empty2.js') || id.endsWith('included.js')) {
					return 'vendor';
				}
			}
		}
	},
	code: codeMap => assert.deepStrictEqual(Object.keys(codeMap).sort(), ['main.js', 'vendor.js'])
});
