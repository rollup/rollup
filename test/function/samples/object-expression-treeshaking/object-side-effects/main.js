let modified1 = false;
let modified2 = false;

function effect1() {
	modified1 = true;
	return 'keyEffect';
}

function effect2() {
	modified2 = true;
	return 4;
}

const obj = {
	used: 1,
	unused: 2,
	[effect1()]: 3,
	valueEffect: effect2()
};
assert.strictEqual(obj.used, 1);
assert.ok(modified1, 'first');
assert.ok(modified2, 'second');
