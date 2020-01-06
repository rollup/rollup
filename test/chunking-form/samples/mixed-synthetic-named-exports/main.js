import {fn, foo} from './dep2.js';
export {fn, stuff, foo} from './dep2.js';

import * as ns from './dep1.js';

const stuff = 12;
console.log(stuff);

console.log(fn);
console.log(foo);
console.log(ns);