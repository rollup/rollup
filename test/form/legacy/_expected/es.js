const foo = 1;
const bar = 2;


var namespace = (Object.freeze || Object)({
	foo: foo,
	bar: bar
});

console.log( Object.keys( namespace ) );

const a = 1;
const b = 2;

export { a, b };
