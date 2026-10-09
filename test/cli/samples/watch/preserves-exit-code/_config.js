const assert = require('node:assert/strict');
const { assertIncludes } = require('../../../../testHelpers.js');

module.exports = defineTest({
	description: 'preserves the process exit code when the watcher terminates naturally',
	spawnArgs: [
		'--watch',
		'--watch.exclude',
		'main.js',
		'--plugin',
		'./exit-code-plugin.cjs',
		'main.js',
		'--file',
		'_actual/out.js'
	],
	after(error) {
		assert.equal(error?.code, 7);
	},
	error() {
		return true;
	},
	stderr(stderr) {
		assertIncludes(stderr, 'created _actual/out.js');
	}
});
