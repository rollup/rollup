class Test {
	foo = { x: 1 };
}

assert.strictEqual(new Test().foo.x, 1);
