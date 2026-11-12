const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'does not export an outer catch parameter assigned after a shadowed inner catch',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('b'), ['outer b']);
	}
});
