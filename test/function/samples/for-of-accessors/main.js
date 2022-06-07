const obj = {
	setter: false,
	set foo(value) {
		this.setter = true;
	}
};

for (obj.foo of [1]);

assert.ok(obj.setter ? true : false);
