const a = (foo = 'fallback a') => assert.strictEqual(foo, 'fallback a');

const obj = {
	a,
	b(foo = 'fallback b') {
		assert.strictEqual(foo, 'fallback b');
	}
};

obj.a();
obj.b();
