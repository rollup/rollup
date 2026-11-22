const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'updates system exports when a var declaration is the body of a for-of or for-in loop',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('bodyVar'), [undefined, 3]);
		assert.deepEqual(valuesOf('bodyIn'), [undefined, 4]);
	}
});
