const obj1 = {foo: false};
const obj2 = {foo: false};
const {a, ...b} = {a: obj1, c: obj2 };

if (a.foo) {
	throw new Error('"a" was not properly declared');
}
a.foo = true;
if (!obj1.foo) {
	throw new Error('"a" was not tracked');
}

if (b.c.foo) {
	throw new Error('"b.c" was not tracked');
}
b.c.foo = true;
if (!obj2.foo) {
	throw new Error('"b" was not tracked');
}
