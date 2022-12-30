const foo = 1;
const bar = 2;

var namespace = /*#__PURE__*/Object.freeze({
	__proto__: null,
	bar: bar,
	foo: foo
});

console.log( Object.keys( namespace ) );

const a = 1;
const b = 2;

export { a, b };
