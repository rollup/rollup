const assert = require('node:assert');

module.exports = defineTest({
	description: 'does not merge helpers into a shared chunk containing top-level await',
	command:
		'rollup a.js b.js --format es --dir _actual --entryFileNames [name].mjs --chunkFileNames [name].mjs --experimentalMinChunkSize 100 --silent && node _actual/a.mjs',
	result(output) {
		assert.strictEqual(output.trim(), 'App');
	}
});
