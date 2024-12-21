let mutated = false;

var { a } = {
	a: {
		get b() {
			mutated = true;
			return {};
		}
	},
	b: {}
};

a.b;
assert.ok(mutated);
