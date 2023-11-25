var value = 'PASS';
try {
	throw new Error();
} catch ({ code = value }) {
	const value = 'FAIL';
	assert.equal(code, 'PASS');
}
