let effect = false;

const Foo = {
	[Symbol.hasInstance]: () => effect = true
}

if (!(null instanceof Foo)) {
	assert.fail('instanceof not resolved correctly (ignored Symbol.hasInstance)');
}

assert.ok(effect);
