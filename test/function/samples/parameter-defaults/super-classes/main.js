class A {
	constructor(a = 'superConstructorDefault') {
		this.a = a;
	}

	static staticMethod(b = 'superStaticDefault') {
		return b;
	}

	method(c = 'superMethodDefault') {
		return c;
	}
}

class B extends A {
	constructor(a = 'constructorDefault') {
		assert.strictEqual(a, 'constructorDefault');
		super();
	}

	static staticMethod(b = 'staticDefault') {
		assert.strictEqual(b, 'staticDefault');
		return super.staticMethod();
	}

	method(c = 'methodDefault') {
		assert.strictEqual(c, 'methodDefault');
		return super.method();
	}
}

assert.strictEqual(B.staticMethod(), 'superStaticDefault');
const b = new B();
assert.strictEqual(b.a, 'superConstructorDefault');
assert.strictEqual(b.method(), 'superMethodDefault');
