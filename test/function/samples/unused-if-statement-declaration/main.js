let result;

export function testStatement(condition) {
	if (condition) var a = 1, b = result = 1, unused1 = 3;
	else var a = 2, c = result = 2, unused2 = 3;
	return a;
}

assert.strictEqual(testStatement(true), 1);
assert.strictEqual(result, 1);
assert.strictEqual(testStatement(false), 2);
assert.strictEqual(result, 2);
