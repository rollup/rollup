let mutated = false;

const obj = {
	foo: external,
	bar() {
		mutated = true;
	}
};

obj.foo();
assert.ok(mutated ? true : false);
