const foo = 'foo1';

const foo$1 = 'foo2';
const bar = 'bar2';

var dep2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	foo: foo$1,
	bar: bar
}, '__esModule', { value: true }));

console.log(foo);
console.log(foo);

console.log(dep2);
console.log(dep2);
