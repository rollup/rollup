var { a } = {
	a: {
		b(x) {
			x.mutated = true;
		}
	},
	b() {}
};

var obj = { mutated: false };
a.b(obj);

assert.strictEqual(obj.mutated ? 'OK' : 'FAILED', 'OK');
