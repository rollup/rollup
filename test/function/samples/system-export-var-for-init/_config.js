const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, definedValues, execute } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'updates system exports for multiple and destructured var declarations in for-loop initializers',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(definedValues('a'), [1, 2, 3]);
		assert.deepEqual(definedValues('alias'), [1, 2, 3]);
		assert.deepEqual(definedValues('b'), [2]);
		assert.deepEqual(definedValues('c'), [4, 5]);
		assert.deepEqual(definedValues('d'), [1, 2]);
		assert.deepEqual(definedValues('dAlias'), [1, 2]);
		assert.deepEqual(definedValues('e'), [1]);
		assert.deepEqual(definedValues('f'), [6]);
		assert.deepEqual(definedValues('g'), [7, 8]);
	}
});
