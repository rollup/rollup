function test(foo) {
	var foo;
	var foo;
	assert.ok(foo ? true : false);
	return foo;
}

assert.ok(test(true) ? true : false);
