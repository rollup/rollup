export var b = 'outer b';

try {
	throw 0;
} catch (b) {
	{
		try {
			throw 1;
		} catch (b) {
			var b = 1;
			assert.equal(b, 1);
		}
		var b = 2;
		assert.equal(b, 2);
	}
	assert.equal(b, 2);
}

assert.equal(b, 'outer b');
