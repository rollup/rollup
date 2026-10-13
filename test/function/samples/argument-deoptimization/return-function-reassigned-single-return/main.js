var updateTarget = () => {};
const obj = { mutated: false };

function updateObj() {
	updateTarget = target => {
		target.mutated = true;
	};
	return updateTarget;
}

updateObj()(obj);
assert.ok(obj.mutated ? true : false);
