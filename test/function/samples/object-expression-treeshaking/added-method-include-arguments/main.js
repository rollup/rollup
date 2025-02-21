const bar = {};

bar.setFoo = function (value) {
	bar.foo = value;
};

bar.setFoo(true);
assert.strictEqual(bar.foo, true);
