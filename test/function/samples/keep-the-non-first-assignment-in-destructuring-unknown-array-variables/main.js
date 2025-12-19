const [a, last2 = { foo: true }] = unknownVariable;
assert.ok(last2.foo);
