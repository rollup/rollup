import { value1 } from './lib1.js';
import { value1 as v1, value2 } from './lib2.js';

console.log(value1);
console.log(v1);
console.log(value2);
console.log(import('./lib3.js').then(m => m.value3));
