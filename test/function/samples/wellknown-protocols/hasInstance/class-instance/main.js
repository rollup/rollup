let effect = false;

class Foo {
	[Symbol.hasInstance]() {
		return effect = true;
	}
}

const foo = new Foo();
if (!(null instanceof foo)) {
	assert.fail('instanceof not resolved correctly (ignored Symbol.hasInstance)');
}

assert.ok(effect);
