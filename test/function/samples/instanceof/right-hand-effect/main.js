let effect = false;

class Foo {}

if (
	new Foo() instanceof
	class {
		[(effect = true)]() {}
	}
) {
	assert.fail('Wrong instance relation');
}

assert.ok(effect);
