const foo = 'foo1';

const foo$1 = 'foo2';
const bar = 'bar2';

var dep2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	foo: foo$1,
	bar: bar
});

console.log(foo);
console.log(foo);

console.log(dep2);
console.log(dep2);
