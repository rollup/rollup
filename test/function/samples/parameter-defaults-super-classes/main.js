class A {
	constructor(a = 'default') {
		this.a = a;
	}
}

class B extends A {
	constructor(a = 'default') {
		assert.strictEqual(a, 'default');
		super();
	}
}

const b = new B();
assert.strictEqual(b.a, 'default');
