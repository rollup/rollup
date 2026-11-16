export let current, key, first, second, prop, seen, inline, shadowed, renamed;
export let joined = '';
export let shadowLog = '';
export let exportShadow = 0;
const kept = [];

export function run() {
	for (current of ['a', 'b']);
	for (key in { k: 1 });
	for ([first, second] of [['x', 'y']]);
	for ({ prop } of [{ prop: 'p' }]);
	for (seen of ['a', 'b']) {
		joined += seen;
	}
	for (inline of ['q']) inline += '!';
	for (const ignored of ['nope']);
	for (shadowed of ['outer']) {
		let shadowed = 'inner';
		shadowLog += shadowed;
	}
	for (renamed of ['z']) {
		let exports = 1;
		kept.push(exports);
	}
	exportShadow = kept[0];
}

run();
