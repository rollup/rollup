const assert = require('node:assert/strict');

const exportedValues = new Map();
let execute;

module.exports = defineTest({
	description: 'updates system exports for bindings assigned in for-of and for-in heads',
	options: { output: { format: 'system' } },
	context: {
		System: {
			register(_dependencies, declaration) {
				({ execute } = declaration(recordSystemExport));
			}
		}
	},
	exports() {
		execute();
		assert.equal(exportedValues.get('current'), 'b');
		assert.equal(exportedValues.get('key'), 'k');
		assert.equal(exportedValues.get('first'), 'x');
		assert.equal(exportedValues.get('second'), 'y');
		assert.equal(exportedValues.get('prop'), 'p');
		assert.equal(exportedValues.get('seen'), 'b');
		assert.equal(exportedValues.get('joined'), 'ab');
		assert.equal(exportedValues.get('inline'), 'q!');
		assert.equal(exportedValues.get('shadowed'), 'outer');
		assert.equal(exportedValues.get('shadowLog'), 'inner');
		assert.equal(exportedValues.get('renamed'), 'z');
		assert.equal(exportedValues.get('exportShadow'), 1);
	}
});

function recordSystemExport(name, value) {
	if (typeof name === 'object' && name !== null) {
		for (const key of Object.keys(name)) {
			exportedValues.set(key, name[key]);
		}
		return name;
	}
	exportedValues.set(name, value);
	return value;
}
