let foo, unused;
null, { foo } = { foo: 'bar' };
assert.strictEqual(foo, 'bar');

const assign = () => unused = { foo } = { foo: 'baz' };
assign();
assert.strictEqual(foo, 'baz');
