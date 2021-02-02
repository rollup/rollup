let result = 3;
var b = 3;

while (b > 0)
var b = b - 1, unused = result--, unused2 = 0;

assert.strictEqual(b, 0);
assert.strictEqual(result, 0);
