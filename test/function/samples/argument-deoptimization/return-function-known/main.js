const obj = { mutated: false };

function updateObj() {
	return target => {
		target.mutated = true;
	};
}

updateObj()(obj);

assert.ok(obj.mutated ? true : false);
