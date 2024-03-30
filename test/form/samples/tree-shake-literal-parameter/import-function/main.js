import add, { add1, add2, add3, add4 } from './lib.js'
import arrowAdd, { arrowAdd1, arrowAdd2, arrowAdd3 } from './arrow_lib.js'

function foo(bar) {
	console.log(bar());
}

console.log(add(1, 2, true));
console.log(add1(1, 2, false));
console.log(add2(1, 2)); // unused argument should be treated as undefined
console.log(foo(add3))
console.log(add4(1, 2, true));

console.log(arrowAdd(1, 2, true));
console.log(arrowAdd1(1, 2, false));
console.log(foo(arrowAdd2));
console.log(arrowAdd3(1, 2, true));