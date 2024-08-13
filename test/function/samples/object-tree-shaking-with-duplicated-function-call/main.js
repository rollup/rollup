function foo(c) {
	assert.ok(c.a);
}

foo({ a: 1 });
foo({ a: 1 });
