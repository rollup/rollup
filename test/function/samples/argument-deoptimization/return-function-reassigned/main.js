var updateTarget = () => {};

const obj = { mutated: false };

function updateObj(condition) {
	if (condition) return updateTarget;
	updateTarget = target => {
		target.mutated = true;
	};
	return updateTarget;
}

updateObj(globalThis.condition)(obj);

assert.ok(obj.mutated ? true : false);
