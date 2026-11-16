const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description:
		'renames a block binding that shadows exports when a var is hoisted through that block',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.equal(last('blockVar'), 1);
	}
});
