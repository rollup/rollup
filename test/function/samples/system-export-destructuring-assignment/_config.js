const assert = require('node:assert/strict');

const exportedValues = new Map();
let execute;

module.exports = defineTest({
	description:
		'parenthesizes system export updates for destructuring assignments that start a statement',
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
		assert.equal(exportedValues.get('count'), 1);
		assert.equal(exportedValues.get('top'), 9);
		assert.equal(exportedValues.get('name'), 'ok');
		assert.equal(exportedValues.get('fromExpr'), 4);
		assert.equal(exportedValues.get('seq'), 5);
		assert.equal(exportedValues.get('paired'), 7);
		assert.equal(exportedValues.get('pairedAlias'), 7);
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
