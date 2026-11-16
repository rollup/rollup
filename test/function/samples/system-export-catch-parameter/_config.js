const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'does not export catch parameters that shadow an exported var',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('caught'), ['outer', 'changed']);
	}
});
