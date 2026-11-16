const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'updates system exports for bindings assigned in for-of and for-in heads',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.equal(last('current'), 'b');
		assert.equal(last('key'), 'k');
		assert.equal(last('first'), 'x');
		assert.equal(last('second'), 'y');
		assert.equal(last('prop'), 'p');
		assert.equal(last('seen'), 'b');
		assert.equal(last('joined'), 'ab');
		assert.equal(last('inline'), 'q!');
		assert.equal(last('shadowed'), 'outer');
		assert.equal(last('shadowLog'), 'inner');
		assert.equal(last('renamed'), 'z');
		assert.equal(last('exportShadow'), 1);
	}
});
