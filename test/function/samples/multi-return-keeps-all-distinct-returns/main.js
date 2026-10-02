function pick() {
	if (globalThis.which === 0) return () => 'a';
	if (globalThis.which === 1) return () => 'b';
	if (globalThis.which === 2) return () => 'c';
	if (globalThis.which === 3) return () => 'd';
	if (globalThis.which === 4) return () => 'e';
	return () => 'fallback';
}

function run() {
	return pick()();
}

const values = [];
for (const which of [0, 1, 2, 3, 4]) {
	globalThis.which = which;
	values.push(run());
}

assert.equal(values.join(''), 'abcde');
