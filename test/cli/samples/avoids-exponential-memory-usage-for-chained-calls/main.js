let calls = 0;

function getFunction() {
	calls++;
	if (globalThis.condition) return getFunction;
	return getFunction;
}

const result = getFunction()()()()()()()()()()()()()()()()()()();

assert.strictEqual(result, getFunction);
assert.strictEqual(calls, 19);
