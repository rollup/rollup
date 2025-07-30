let effect = false;

class Foo {
	get [Symbol.toStringTag]() {
		effect = true;
		return "Meow";
	}
}

const foo = '' + (new Foo());
assert.strictEqual(foo, "[object Meow]");
assert.ok(effect);
