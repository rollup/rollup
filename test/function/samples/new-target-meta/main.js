function Foo() {
	assert.strictEqual(new.target, Foo);
}

new Foo();
