function foo() {
	const a = (b.c = { e: 1 });
}
foo();

assert.deepEqual(b.c.e, 1);
