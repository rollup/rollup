import * as ns from './other.js';
import { function as g } from 'external';

console.log(ns, ns.foo, ns['function'], ns['some-prop'], g);
console.log(import.meta['function'], import.meta['some-prop']);

let f = 1;
f++;

export { f as function };
export * as default from 'external';
export { default as void, function as bar } from 'external';
