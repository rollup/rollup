export var a = 'outer';

try {
	throw 0;
} catch (a) {
	try {
		throw 1;
	} catch (b) {
		var a = 2;
		assert.equal(a, 2);
		var a = 3;
		assert.equal(a, 3);
		{
			var a = 4;
			assert.equal(a, 4);
		}
		var a = 5;
		assert.equal(a, 5);
	}
	assert.equal(a, 5);
}

assert.equal(a, 'outer');
