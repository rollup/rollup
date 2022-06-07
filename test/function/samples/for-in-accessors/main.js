const obj = {
	setter: false,
	set foo(value) {
		this.setter = true;
	}
};

for (obj.foo in {x:1});

assert.ok(obj.setter ? true : false);
