let calls = 0;
const withValueOf = {
	valueOf() {
		calls++;
		return 1;
	}
};
assert.strictEqual(withValueOf + 1, 2);
assert.strictEqual(calls, 1);
assert.strictEqual(-withValueOf, -1);
assert.strictEqual(calls, 2);

let stringCalls = 0;
const withToString = {
	toString() {
		stringCalls++;
		return 'x';
	}
};
assert.strictEqual(withToString + 1, 'x1');
assert.strictEqual(stringCalls, 1);
