const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, valuesOf } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'updates system exports for multi-declarator var declarations in if and else branches',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(valuesOf('ifA'), [undefined, 1]);
		assert.deepEqual(valuesOf('ifB'), [undefined, 2]);
		assert.deepEqual(valuesOf('elseA'), [undefined, 3]);
		assert.deepEqual(valuesOf('elseB'), [undefined, 4]);
		assert.deepEqual(valuesOf('patternA'), [undefined, 5]);
		assert.deepEqual(valuesOf('noInitA'), [undefined]);
		assert.deepEqual(valuesOf('noInitB'), [undefined, 6]);
		assert.deepEqual(valuesOf('labelA'), [undefined, 1]);
		assert.deepEqual(valuesOf('labelB'), [undefined, 2]);
		assert.deepEqual(valuesOf('deadBranch'), [0, 1]);
	}
});
