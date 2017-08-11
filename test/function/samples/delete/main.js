var a = { b: 1 };
assert.strictEqual(a.b, 1);
delete a.b;
assert.strictEqual(a.b, undefined);
