let effect = false;

class Foo {
	constructor() {
		Object.defineProperty(this, 'x', {
			set() {
				effect = true;
			}
		});
		this.x = 2;
	}
}

new Foo();
assert.ok(effect);
