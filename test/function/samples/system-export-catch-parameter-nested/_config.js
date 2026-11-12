const assert = require('node:assert/strict');

const exportedValues = new Map();
let execute;

module.exports = defineTest({
	description: 'assigns the outer catch parameter from a var declaration in a nested catch',
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
		assert.equal(exportedValues.get('a'), 'outer');
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
