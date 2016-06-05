import 'external';
import 'other';
import 'another';

const a = 1;
const b = 2;


const namespace = Object.freeze({
	a: a,
	b: b
});

console.log( Object.keys( namespace ) );

const main = 42;

export default main;
