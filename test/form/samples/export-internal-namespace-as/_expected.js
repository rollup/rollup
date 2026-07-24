const foo$1 = 'foo1';

const foo = 'foo2';
const bar = 'bar2';

var dep2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	bar: bar,
	foo: foo
}, null));

console.log(foo$1);
console.log(foo$1);

console.log(dep2);
console.log(dep2);
