const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'prints error cause',
	command: 'rollup --config rollup.config.mjs',
	// We expect an error and want to make assertions about the output
	error: () => true,
	stderr: stderr => {
		// We just assert the parts of the output that do not change
		assertIncludes(stderr, '\n[!] (plugin at position 1) Error: Outer error\n    at ');
		assertIncludes(stderr, '\n  [cause] Error: Inner error\n      at ');
		assertIncludes(stderr, '\n    [cause] Error: Innermost error\n        at ');
	}
});
