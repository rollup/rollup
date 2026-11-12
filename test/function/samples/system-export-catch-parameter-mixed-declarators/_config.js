const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'exports only the non-catch declarations in mixed declarators that shadow an exported var',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('a'), ['outer']);
		assert.deepEqual(valuesOf('b'), ['outer b', 2, 0]);
	}
});
