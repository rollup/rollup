const obj = {
	getter: false,
	setter: false,
	get foo() {
		this.getter = true;
		return 0;
	},
	set foo(value) {
		this.setter = true;
	}
};

obj.foo++;

assert.ok(obj.getter ? true : false);
assert.ok(obj.setter ? true : false);
