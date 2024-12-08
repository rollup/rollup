let mutated = false;

var { a } = {
	a: {
		set b(value) {
			mutated = value;
		}
	},
	b: {}
};

a.b = true;
assert.ok(mutated);
