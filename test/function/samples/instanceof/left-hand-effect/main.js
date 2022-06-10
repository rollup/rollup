let effect = false;

class Bar {}
class Foo {
	constructor() {
		effect = true;
	}
}

if (new Foo() instanceof Bar) {
	assert.fail('Wrong instance relation');
}

assert.ok(effect);
