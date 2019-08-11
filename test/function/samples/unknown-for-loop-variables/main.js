for (const name in {present: true}) {
	if (name !== 'present') {
		throw new Error('Always false for-in check was inlined');
	}
	assert.equal(name, 'present');
}

for (const name of ['present']) {
	if (name !== 'present') {
		throw new Error('Always false for-of check was inlined');
	}
	assert.equal(name, 'present');
}
