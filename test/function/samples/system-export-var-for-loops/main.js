export const trace = [];

export var working;
for (working of ['a', 'b']) {
	trace.push(['working', working]);
}

export var exportedBeforeForOf;
for (var exportedBeforeForOf of ['a', 'b']) {
	trace.push(['exportedBeforeForOf', exportedBeforeForOf]);
}

export { exportedSeparately };
for (var exportedSeparately of ['a', 'b']) {
	trace.push(['exportedSeparately', exportedSeparately]);
}

export var inVar;
for (var inVar in { a: 1, b: 1 }) {
	trace.push(['inVar', inVar]);
}

export var patternFirst, patternSecond;
for (var [patternFirst, patternSecond] of [
	['x', 'y'],
	['u', 'v']
]) {
	trace.push(['patternFirst', patternFirst], ['patternSecond', patternSecond]);
}

export var patternProp;
for (var { patternProp } of [{ patternProp: 'p' }, { patternProp: 'q' }]) {
	trace.push(['patternProp', patternProp]);
}

export var arrayRest, objectRest;
for (var [...arrayRest] of [[1, 2], [3]]) {
	trace.push(['arrayRest', arrayRest]);
}
for (var { ...objectRest } of [{ x: 1 }, { y: 2 }]) {
	trace.push(['objectRest', objectRest]);
}

export var withDefault;
for (var { withDefault = 'fallback' } of [{}, { withDefault: 'set' }]) {
	trace.push(['withDefault', withDefault]);
}

export var emptyVar;
for (var emptyVar of ['e']);

export var inlineVar = '';
for (var inlineVar of ['q']) inlineVar += '!';

export var shadowedVar;
for (var shadowedVar of ['outer']) {
	let shadowedVar = 'inner';
	trace.push(['shadowedVar', shadowedVar]);
}

export var renamedVar;
for (var renamedVar of ['z']) {
	let exports = 1;
	trace.push(['blockExports', exports]);
}

for (var notExported of ['nope']);

export var outerShadow;
{
	let exports = 1;
	for (var outerShadow of ['a', 'b']) {
		trace.push(['outerShadow', outerShadow]);
	}
	trace.push(['outerShadowExports', exports]);
}

export var outerIn;
{
	let exports = 3;
	for (var outerIn in { a: 1 }) {
		trace.push(['outerIn', outerIn]);
	}
	trace.push(['outerInExports', exports]);
}

export var patternOuterA, patternOuterB;
{
	let exports = 5;
	for (var [patternOuterA, patternOuterB] of [['m', 'n']]) {
		trace.push(['patternOuter', [patternOuterA, patternOuterB]]);
	}
	trace.push(['patternOuterExports', exports]);
}

export var exports;
let seenRenamed = '';
{
	let exports$1 = 2;
	for (var exports of ['a', 'b']) {
		seenRenamed += exports$1;
	}
}
trace.push(['renamedExports', seenRenamed]);

export var assignedOuter;
{
	let exports = 4;
	for (assignedOuter of ['p', 'q']) {
		trace.push(['assignedOuter', assignedOuter]);
	}
	trace.push(['assignedOuterExports', exports]);
}

export var notInner = 'keep';
function wrapLoop() {
	for (var notInner of ['z']) {
		trace.push(['notInner', notInner]);
	}
}
wrapLoop();

export var fromFunction;
function assignOuter() {
	let exports = 8;
	for (fromFunction of ['m']) {
		trace.push(['fromFunction', fromFunction]);
	}
	trace.push(['fromFunctionExports', exports]);
}
assignOuter();
