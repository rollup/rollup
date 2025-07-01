if (typeof parseInt === 'function' && 'a' === 'b') {
	assert.ok(false);
}

if (typeof parseInt === 'function' || 'a' === 'a') {
	assert.ok(true);
}

if (typeof parseInt === 'function' ?? 'a' === 'a') {
	assert.ok(true);
}

if (!(unknownGlobal ? 'asdf' : true)) {
	assert.ok(false);
}

if (unknownGlobal ? 0 : false) {
	assert.ok(false);
}

if (!(unknownGlobal ? 'a' === 'a' : true)) {
	assert.ok(false);
}
