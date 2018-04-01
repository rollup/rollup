const foo = {};

// new parent is expression statement
true && {
	a: foo.a = true,
	b: foo.a = true
};
assert.ok(foo.a);

export default foo;
