export var a = 'outer';
export var b = 'outer b';

try {
	throw 0;
} catch (a) {
	var a = 1,
		b = 2;
	assert.equal(a, 1);
	assert.equal(b, 2);
	for (var a = 0, b = 0; a < 2; a++);
	assert.equal(a, 2);
	assert.equal(b, 0);
}

assert.equal(a, 'outer');
assert.equal(b, 0);
