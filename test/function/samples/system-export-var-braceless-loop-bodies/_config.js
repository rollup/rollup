const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, definedValues, execute } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'updates system exports for multiple var declarations in braceless loop bodies',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(definedValues('forOfA'), [1, 2]);
		assert.deepEqual(definedValues('forOfB'), [2, 4]);
		assert.deepEqual(definedValues('forInA'), ['x', 'y']);
		assert.deepEqual(definedValues('forInB'), ['x', 'y']);
		assert.deepEqual(definedValues('classicA'), [0, 1]);
		assert.deepEqual(definedValues('classicB'), [0, 1]);
		assert.deepEqual(definedValues('whileA'), [0, 1]);
		assert.deepEqual(definedValues('whileB'), [1, 2]);
		assert.deepEqual(definedValues('doA'), [0, 1]);
		assert.deepEqual(definedValues('doB'), [0, 1]);
		assert.deepEqual(definedValues('patternA'), [3]);
		assert.deepEqual(definedValues('patternB'), [3]);
		assert.deepEqual(definedValues('trailingPattern'), [5]);
		assert.deepEqual(definedValues('wrappedLast'), [5]);
	}
});
