const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not merge shared modules into an awaiting entry',
	command:
		'rollup main.js --format es --dir _actual --entryFileNames [name].mjs --chunkFileNames [name].mjs --experimentalMinChunkSize 100 --silent && node _actual/main.mjs',
	result(output) {
		assert.strictEqual(output.trim(), 'App');
	}
});
