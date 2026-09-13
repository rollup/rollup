let mutated = false;
globalThis.makeCallback = () => () => (mutated = true);

function outer(callback) {
	if (globalThis.c) return callback();
	return callback();
}

const result = outer(globalThis.makeCallback)();

assert.ok(result === true && mutated);
