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

// Update Expression
a++, b++, ++c;

// Class Declaration
export class A {} 
export { A as B }

