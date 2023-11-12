var value = 'PASS';
try {
	throw new Error();
} catch ({ code = value }) {
	assert.equal(code, 'PASS');
}
