const assert = require('node:assert/strict');

const exportHistory = [];
let execute;

module.exports = defineTest({
	description:
		'updates system exports when a var declaration is the body of a for-of or for-in loop',
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
		assert.deepEqual(valuesOf('bodyVar'), [undefined, 3]);
		assert.deepEqual(valuesOf('bodyIn'), [undefined, 4]);
	}
});

function recordSystemExport(name, value) {
	if (typeof name === 'object' && name !== null) {
		for (const key of Object.keys(name)) {
			exportHistory.push([key, name[key]]);
		}
		return name;
	}
	exportHistory.push([name, value]);
	return value;
}

function valuesOf(name) {
	return exportHistory.filter(([key]) => key === name).map(([, value]) => value);
}
