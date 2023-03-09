const obj = {
	nested: {
		get mutator() {
			this.mutated = true;
		},
		mutated: false
	}
};

function updateObj(target) {
	target.nested.mutator;
}

updateObj(obj);

assert.ok(obj.nested.mutated ? true : false);
