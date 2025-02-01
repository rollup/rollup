const { a, b } = {
	get a() {
		// We cannot remove a as destructuring will trigger this getter
		this.b = true;
	},
	b: false
};

assert.strictEqual(b ? 'OK' : 'FAILED', 'OK');
