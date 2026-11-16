const assert = require('node:assert/strict');
const { getSystemExportRecorder } = require('../../../testHelpers.js');

const { context, definedValues, execute, last } = getSystemExportRecorder();

module.exports = defineTest({
	description: 'updates system exports for var bindings in for-of and for-in heads',
	options: { output: { format: 'system' } },
	context,
	exports() {
		execute();
		assert.deepEqual(last('trace'), [
			['working', 'a'],
			['working', 'b'],
			['exportedBeforeForOf', 'a'],
			['exportedBeforeForOf', 'b'],
			['exportedSeparately', 'a'],
			['exportedSeparately', 'b'],
			['inVar', 'a'],
			['inVar', 'b'],
			['patternFirst', 'x'],
			['patternSecond', 'y'],
			['patternFirst', 'u'],
			['patternSecond', 'v'],
			['patternProp', 'p'],
			['patternProp', 'q'],
			['arrayRest', [1, 2]],
			['arrayRest', [3]],
			['objectRest', { x: 1 }],
			['objectRest', { y: 2 }],
			['withDefault', 'fallback'],
			['withDefault', 'set'],
			['shadowedVar', 'inner'],
			['blockExports', 1],
			['outerShadow', 'a'],
			['outerShadow', 'b'],
			['outerShadowExports', 1],
			['outerIn', 'a'],
			['outerInExports', 3],
			['patternOuter', ['m', 'n']],
			['patternOuterExports', 5],
			['renamedExports', '22'],
			['assignedOuter', 'p'],
			['assignedOuter', 'q'],
			['assignedOuterExports', 4],
			['notInner', 'z'],
			['fromFunction', 'm'],
			['fromFunctionExports', 8]
		]);
		assert.deepEqual(definedValues('working'), ['a', 'b']);
		assert.deepEqual(definedValues('exportedBeforeForOf'), ['a', 'b']);
		assert.deepEqual(definedValues('exportedSeparately'), ['a', 'b']);
		assert.deepEqual(definedValues('inVar'), ['a', 'b']);
		assert.deepEqual(definedValues('patternFirst'), ['x', 'u']);
		assert.deepEqual(definedValues('patternSecond'), ['y', 'v']);
		assert.deepEqual(definedValues('arrayRest'), [[1, 2], [3]]);
		assert.deepEqual(definedValues('objectRest'), [{ x: 1 }, { y: 2 }]);
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
