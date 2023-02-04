const a = (foo = 'fallback a') => assert.strictEqual(foo, 'fallback a');

const b = (foo = 'fallback b') => assert.strictEqual(foo, 'fallback b');

class Test {
	static staticField = a;
	field = b;
}

Test.staticField();
new Test().field();
