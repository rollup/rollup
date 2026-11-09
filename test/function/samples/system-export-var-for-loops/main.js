export let trace = '';

export var working;
for (working of ['a', 'b']) {
	trace += 'W' + working;
}

export var notWorking1;
for (var notWorking1 of ['a', 'b']) {
	trace += '1' + notWorking1;
}

export { notWorking2 };
for (var notWorking2 of ['a', 'b']) {
	trace += '2' + notWorking2;
}

export var inVar;
for (var inVar in { a: 1, b: 1 }) {
	trace += 'I' + inVar;
}

export var patternFirst, patternSecond;
for (var [patternFirst, patternSecond] of [
	['x', 'y'],
	['u', 'v']
]) {
	trace += patternFirst + patternSecond;
}

export var patternProp;
for (var { patternProp } of [{ patternProp: 'p' }, { patternProp: 'q' }]) {
	trace += patternProp;
}

export var withDefault;
for (var { withDefault = 'fallback' } of [{}, { withDefault: 'set' }]) {
	trace += withDefault;
}

export var emptyVar;
for (var emptyVar of ['e']);

export var inlineVar = '';
for (var inlineVar of ['q']) inlineVar += '!';

export var shadowedVar;
for (var shadowedVar of ['outer']) {
	let shadowedVar = 'inner';
	trace += shadowedVar;
}

export var renamedVar;
const kept = [];
for (var renamedVar of ['z']) {
	let exports = 1;
	kept.push(exports);
}
trace += kept[0];

for (var notExported of ['nope']);

export var outerShadow;
{
	let exports = 1;
	for (var outerShadow of ['a', 'b']) {
		trace += 'S';
	}
	trace += exports;
}

export var outerIn;
{
	let exports = 3;
	for (var outerIn in { a: 1 }) {
		trace += 'N';
	}
	trace += exports;
}

export var patternOuterA, patternOuterB;
{
	let exports = 5;
	for (var [patternOuterA, patternOuterB] of [['m', 'n']]) {
		trace += 'P';
	}
	trace += exports;
}

export var exports;
let seenRenamed = '';
{
	let exports$1 = 2;
	for (var exports of ['a', 'b']) {
		seenRenamed += exports$1;
	}
}
trace += seenRenamed;

export var assignedOuter;
{
	let exports = 4;
	for (assignedOuter of ['p', 'q']) {
		trace += 'A';
	}
	trace += exports;
}

export var notInner = 'keep';
function wrapLoop() {
	let exports = 9;
	for (var notInner of ['z']) {
		trace += 'F';
	}
	trace += exports;
}
wrapLoop();

export var fromFunction;
function assignOuter() {
	let exports = 8;
	for (fromFunction of ['m']) {
		trace += 'G';
	}
	trace += exports;
}
assignOuter();
