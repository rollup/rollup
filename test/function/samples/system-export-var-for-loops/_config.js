const assert = require('node:assert/strict');

const exportHistory = [];
let execute;

module.exports = defineTest({
	description: 'updates system exports for var bindings in for-of and for-in heads',
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
		assert.equal(last('trace'), 'WaWb1a1b2a2bIaIbxyuvpqfallbacksetinner1SS1N3P522AA4F9G8');
		assert.deepEqual(definedValues('working'), ['a', 'b']);
		assert.deepEqual(definedValues('notWorking1'), ['a', 'b']);
		assert.deepEqual(definedValues('notWorking2'), ['a', 'b']);
		assert.deepEqual(definedValues('inVar'), ['a', 'b']);
		assert.deepEqual(definedValues('patternFirst'), ['x', 'u']);
		assert.deepEqual(definedValues('patternSecond'), ['y', 'v']);
		assert.deepEqual(definedValues('patternProp'), ['p', 'q']);
		assert.deepEqual(definedValues('withDefault'), ['fallback', 'set']);
		assert.equal(last('emptyVar'), 'e');
		assert.deepEqual(definedValues('inlineVar'), ['', 'q', 'q!']);
		assert.deepEqual(definedValues('shadowedVar'), ['outer']);
		assert.equal(last('renamedVar'), 'z');
		assert.deepEqual(definedValues('notExported'), []);
		assert.equal(last('outerShadow'), 'b');
		assert.equal(last('outerIn'), 'a');
		assert.equal(last('patternOuterA'), 'm');
		assert.equal(last('patternOuterB'), 'n');
		assert.deepEqual(definedValues('exports'), ['a', 'b']);
		assert.equal(last('assignedOuter'), 'q');
		assert.equal(last('notInner'), 'keep');
		assert.equal(last('fromFunction'), 'm');
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

function definedValues(name) {
	return valuesOf(name).filter(value => value !== undefined);
}

function last(name) {
	const values = valuesOf(name);
	assert.ok(values.length > 0, name);
	return values[values.length - 1];
}
