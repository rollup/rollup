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

run();
