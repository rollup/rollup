export let count = 0;
export function reset(values) {
	[count] = values;
}

export let name = '';
({ name } = { name: 'ok' });

export let current, key, first, second, prop, seen;
export let joined = '';

export function run() {
	for (current of ['a', 'b']);
	for (key in { k: 1 });
	for ([first, second] of [['x', 'y']]);
	for ({ prop } of [{ prop: 'p' }]);
	for (seen of ['a', 'b']) {
		joined += seen;
	}
	for (const ignored of ['nope']);
}

export var declaredOf;
for (var declaredOf of ['a', 'b']) {
	console.log(declaredOf);
}

export { separateOf };
for (var separateOf of ['c', 'd']);

export var declaredIn;
for (var declaredIn in { k: 1 }) {
	console.log(declaredIn);
}

export var patternA, patternB;
for (var [patternA, patternB] of [['x', 'y']]);

export var patternProp;
for (var { patternProp } of [{ patternProp: 'p' }]);

export var withDefault;
for (var { withDefault = 'fallback' } of [{}]);

export var inlineVar = '';
for (var inlineVar of ['q']) inlineVar += '!';

export var shadowedVar;
for (var shadowedVar of ['outer']) {
	let shadowedVar = 'inner';
	console.log(shadowedVar);
}

export var renamedVar;
for (var renamedVar of ['z']) {
	let exports = 1;
	console.log(exports);
}

run();
