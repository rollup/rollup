// Namespace variable
import * as namespace from './namespace';
export { namespace, namespace as namespace2 }
export * from './namespace';

// Variable Declaration
export let a = 1, b = 2, c = 3;
export { a as a2, c as c2 }

// Export default expression
export default a;

// Assignment Expression
a = b = c = 0;

// Destructing Assignment Expression
({ a, b, c } = { c: 4, b: 5, a: 6 });

// Destructuring Defaults
export var p = 5;
export var q = 10;
export { p as pp, q as qq }
({ p = q = 20 } = {});

// Function Assignment
export function fn () {

}
fn = 5;
export { fn as fn2 }

// Update Expression
a++, b++, ++c;
true && a++;

// Class Declaration
export class A {} 
export { A as B }
