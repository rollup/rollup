const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'assigns the outer catch parameter from a var declaration in a nested catch',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.equal(last('a'), 'outer');
	}
});
