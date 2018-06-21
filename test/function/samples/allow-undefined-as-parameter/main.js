function foo(undefined) {
	if (!undefined) {
		throw new Error('Parameter was not tracked properly')
	}
	assert.ok(undefined);
}

foo(true);
