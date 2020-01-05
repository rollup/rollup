import {fn, foo} from './dep2.js';
export {fn, foo} from './dep2.js';

import * as ns from './dep1.js';

console.log(fn);
console.log(foo);
console.log(ns);