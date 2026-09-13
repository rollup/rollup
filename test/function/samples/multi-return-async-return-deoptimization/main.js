let mutated = false;

async function asyncFactory() {
	return () => 1;
}

function pick() {
	if (globalThis.c) return asyncFactory();
	return () => (mutated = true);
}

const result = pick()();

assert.ok(result === true && mutated);
