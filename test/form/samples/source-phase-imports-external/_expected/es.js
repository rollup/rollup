import source mod2__source from './dep1.js';
import mod2 from './dep1.js';
import source dep2__source from 'dep2';

console.log(mod2__source);
console.log(mod2);
console.log(dep2__source);
