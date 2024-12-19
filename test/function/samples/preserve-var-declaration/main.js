{
	var a = { c: 1 };
	var b = { a };
	assert.deepEqual(b.a.c, 1);
}
