error = 3;
try {
	throw new Error('failed');
} catch (error) {
	var error = 4;
	assert.equal(error, 4);
}
assert.equal(error, 3);
