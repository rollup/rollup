let result;

for (const [foo] of [['foo']]) {
	result = foo;
}
assert.strictEqual(result, 'foo');

for (const { bar } of [{ bar: 'bar' }]) {
	result = bar;
}
assert.strictEqual(result, 'bar');
