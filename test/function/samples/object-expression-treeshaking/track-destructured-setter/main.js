let effect = false;
const obj = {
	set foo(value) {
		effect = value;
	}
};
({ foo: obj.foo } = { foo: 'value' });
assert.strictEqual(effect, 'value');
