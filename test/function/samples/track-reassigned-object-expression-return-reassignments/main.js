const foo = { foo: false };
const bar = { bar: false };
let obj2 = {};

const obj1 = {
	foo() {return foo;},
	bar: () => bar
};

obj2 = obj1;

obj2.foo().foo = true;
obj2.bar().bar = true;

if (!foo.foo) {
	throw new Error('function return expression was not reassigned');
}

if (!bar.bar) {
	throw new Error('arrow function return expression was not reassigned');
}
