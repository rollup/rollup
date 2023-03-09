const obj = {
	mutator() {
		this.mutated = true;
	},
	mutated: false
};

function updateObj(target) {
	target.mutator();
}

updateObj(obj);

assert.ok(obj.mutated ? true : false);
