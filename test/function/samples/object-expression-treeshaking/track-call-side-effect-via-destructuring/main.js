let mutated = false;

var { a } = {
	a: {
		b() {
			mutated = true;
		}
	},
	b() {}
};

a.b();
assert.ok(mutated);
