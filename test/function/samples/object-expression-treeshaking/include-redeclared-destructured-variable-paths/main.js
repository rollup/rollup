var { a } = { a: { b: 1 } };
assert.strictEqual(a.b, 1);

var { a } = { a: { b: 2 } };
assert.strictEqual(a.b, 2);
