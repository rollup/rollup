var { a } = {
	a: { b: () => true },
	b: () => false
};

assert.strictEqual(a.b() ? 'OK' : 'FAILED', 'OK');
