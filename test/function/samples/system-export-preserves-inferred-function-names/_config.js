const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'preserves inferred names of anonymous functions and classes in exported system declarations',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.equal(last('arrow').name, 'arrow');
		assert.equal(last('functionExpression').name, 'functionExpression');
		assert.equal(last('classExpression').name, 'classExpression');
		assert.equal(last('second').name, 'second');
		assert.equal(last('single').name, 'single');
		assert.equal(last('namedFunction').name, 'explicitName');
	}
});
