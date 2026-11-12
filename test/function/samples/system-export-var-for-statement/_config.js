const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'updates system exports for a var binding declared in a for-loop head',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('index'), [undefined, 0, 1, 2]);
	}
});
