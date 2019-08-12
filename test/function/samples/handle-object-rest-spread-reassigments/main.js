const obj1 = {
	foo: false,
	bar: {
		baz: false
	}
};

const obj2 = {
	...obj1
};

obj2.foo = true;

if (obj1.foo) {
	throw new Error('obj1.foo was wrongly reassigned');
}

obj2.bar.baz = true;

if (!obj1.bar.baz) {
	throw new Error('reassigment of obj1.bar.baz was not tracked');
}
