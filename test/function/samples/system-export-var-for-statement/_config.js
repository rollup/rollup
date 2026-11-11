const assert = require('node:assert/strict');

const exportHistory = [];
let execute;

module.exports = defineTest({
	description: 'updates system exports for a var binding declared in a for-loop head',
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
		assert.deepEqual(valuesOf('index'), [undefined, 0, 1, 2]);
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
