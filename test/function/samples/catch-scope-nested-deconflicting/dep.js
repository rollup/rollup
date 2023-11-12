try {
	throw new Error('1');
} catch (e) {
	try {
		throw new Error('2');
	} catch (e) {
		var e = 'e';
		assert.equal(e, 'e');
	}
	assert.equal(e.message, '1');
}
assert.equal(e, undefined);
