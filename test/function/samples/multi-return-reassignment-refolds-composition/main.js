let value = 'first';

function maker() {
	return globalThis.c ? () => value : () => value;
}

function run() {
	return maker()();
}

const first = run();

value = 'second';
const second = run();

assert.equal(first, 'first');
assert.equal(second, 'second');
