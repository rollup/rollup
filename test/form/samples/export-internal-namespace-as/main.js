import * as dep1 from './dep1.js';
import * as dep2 from './dep2.js';
import { dep1 as reexportedDep1, dep2 as reexportedDep2 } from './reexport.js';

console.log(reexportedDep1.foo);
console.log(dep1.foo);

console.log(reexportedDep2);
console.log(dep2);
