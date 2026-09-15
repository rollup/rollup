let mutated = false;

function descend(depth) {
	if (depth === 0) return () => (mutated = true);
	return globalThis.c ? descend(depth - 1) : descend(depth - 1);
}

const result = descend(5)();

assert.ok(result === true && mutated);
