let effect = false;

const Foo = {
	get [Symbol.toStringTag] () {
		effect = true;
		return "Meow";
	}
}

const foo = '' + Foo;
assert.strictEqual(foo, "[object Meow]");
assert.ok(effect);
