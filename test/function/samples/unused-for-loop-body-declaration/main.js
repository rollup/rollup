let result = 3;

for (var a = 0; a < 3; a++) var b = a, unused = result--;

assert.strictEqual(b, 2);
assert.strictEqual(result, 0);
