let result = 3;
var b = 3;

for (var x of [1, 2]) var b = b - 1, unused = result--, unused2 = 0;

assert.strictEqual(b, 1);
assert.strictEqual(result, 1);
