const assert = require('node:assert/strict');

const exportedValues = new Map();
let execute;

module.exports = defineTest({
	description:
		'renames a block binding that shadows exports when a var is hoisted through that block',
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
		assert.equal(exportedValues.get('blockVar'), 1);
	}
});

function recordSystemExport(name, value) {
	exportedValues.set(name, value);
	return value;
}
