function foo() {
	var fn = 1;
	function fn() {}
	function fn() {}
	var fn = 2;

	assert.equal(fn, 2);
}

foo();
