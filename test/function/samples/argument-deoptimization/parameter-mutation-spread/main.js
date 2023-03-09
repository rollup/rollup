const obj1 = { mutated: false };
const obj2 = { mutated: false };

function updateObj(...args) {
	args[0].mutated = true;
	args[1].mutated = true;
}

updateObj(obj1, obj2);

assert.ok(obj1.mutated ? true : false, 'obj1');
assert.ok(obj2.mutated ? true : false, 'obj2');
