export function f(a) {
	try {
		throw 0;
	} catch (b) {
		var a = 1;
		assert.equal(a, 1);
		var a = 2;
		assert.equal(a, 2);
	}
	return a;
}

assert.equal(f('param'), 2);
