import add, { add1, add2, add3, add4 } from './lib.js'

function foo(bar) {
	console.log(bar());
}

console.log(add(1, 2, true));
console.log(add1(1, 2, true));
console.log(add2(1, 2)); // unused should be treated as undefined
console.log(foo(add3))
console.log(add4(1, 2, true));
