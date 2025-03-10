if (typeof parseInt === 'function' && 'a' === 'b') {
	assert.ok(false);
}

if (typeof parseInt === 'function' || 'a' === 'a') {
	assert.ok(true);
}

if (typeof parseInt === 'function' ?? 'a' === 'a') {
	assert.ok(true);
}
