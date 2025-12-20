let effect = false;

class Foo {
	static [Symbol.hasInstance]() {
		return effect = true;
	}
}

if (!(null instanceof Foo)) {
	assert.fail('instanceof not resolved correctly (ignored Symbol.hasInstance)');
}

assert.ok(effect);
