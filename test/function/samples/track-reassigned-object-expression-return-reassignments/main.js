const obj = { x: false };
let obj2 = {};

const obj1 = {
	foo: () => obj
};

obj2 = obj1;

obj2.foo().x = true;

if (!obj.x) {
	throw new Error('return expression was not reassigned');
}
