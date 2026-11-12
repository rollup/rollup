const assert = require('node:assert/strict');

const exportHistory = [];
let execute;

module.exports = defineTest({
	description: 'does not export catch parameters that shadow an exported var',
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
		assert.deepEqual(valuesOf('caught'), ['outer', 'changed']);
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
