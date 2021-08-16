import * as ns from './other.js';

console.log(ns, ns.foo, ns['function'], ns['some-prop']);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };
