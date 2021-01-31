import { curry } from './curry';
let result;

function foo() {
	result = 'foo';
}

var fooc = curry(foo);
fooc();

assert.strictEqual(result, 'foo');
