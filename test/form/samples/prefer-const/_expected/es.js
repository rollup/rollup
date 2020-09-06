import { name } from 'other';

const a = 1;
const b = 2;

const namespace = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	a: a,
	b: b
}, '__esModule', { value: true }));

console.log( Object.keys( namespace ) );
console.log( name );

const main = 42;

export default main;
