const obj1 = {};
let prop = 'x';

updateProp();

obj1[prop] = true;

assert.strictEqual(obj1.y ? 'WORKING' : 'BUG', 'WORKING');

function updateProp() {
	prop = 'y';
}

const obj2 = {};
obj2[getResult().prop] = 1;

assert.equal(obj2.foo ? 'WORKING' : 'BUG', 'WORKING');

function getResult() {
	const result = {};
	result.prop = 'foo';
	return result;
}

