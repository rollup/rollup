const foo = 1;
const bar = 2;

var namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	foo: foo,
	bar: bar
}, '__esModule', { value: true }));

console.log( Object.keys( namespace ) );

const a = 1;
const b = 2;

export { a, b };
