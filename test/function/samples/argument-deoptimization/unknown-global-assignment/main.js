globalThis.obj = {
	set target(value) {
		value.mutated = true;
	}
};

const assigned = {
	mutated: false
};

obj.target = assigned;

assert.ok(assigned.mutated ? true : false);
