try {
	throw new Error();
} catch (e) {
	var e = 1;
	{
		var e = 2;
	}
	assert.equal(e, 2);
}
assert.equal(e, undefined);
