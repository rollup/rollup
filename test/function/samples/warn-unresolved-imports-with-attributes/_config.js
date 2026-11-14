const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'distinguishes unresolved imports that differ only by import attributes',
	warnings(warnings) {
		assert.deepEqual(
			warnings.map(warning => warning.message),
			[
				'"pkg" is imported by "main.js", but could not be resolved – treating it as an external dependency.',
				'"pkg" with import attributes {"type":"json"} is imported by "main.js", but could not be resolved – treating it as an external dependency.'
			]
		);
	}
});
