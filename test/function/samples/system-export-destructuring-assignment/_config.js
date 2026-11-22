const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'parenthesizes system export updates for destructuring assignments that start a statement',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.equal(last('count'), 1);
		assert.equal(last('top'), 9);
		assert.equal(last('name'), 'ok');
		assert.equal(last('fromExpr'), 4);
		assert.equal(last('seq'), 5);
		assert.equal(last('paired'), 7);
		assert.equal(last('pairedAlias'), 7);
	}
});
