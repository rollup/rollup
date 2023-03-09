const obj = { nested: { mutated: false } };

function updateObj({ nested }) {
	nested.mutated = true;
}

updateObj(obj);

assert.ok(obj.nested.mutated ? true : false);
