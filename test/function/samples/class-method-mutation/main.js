let effect = false;

class Foo {
	method() {}
}

const foo = new Foo();
Object.defineProperty(foo.method, 'effect', {
	get() {
		effect = true;
	}
});

Foo.prototype.method.effect;
