try {
	throw new Error('failed');
} catch (error) {
	var error = 1;
	assert.ok(error === 1 ? true : false);
}
assert.ok(error === undefined ? true : false);
