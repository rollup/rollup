import { value1, a as value1$1, v as value2 } from './generated-lib1.js';

console.log(value1);
console.log(value1$1);
console.log(value2);
console.log(import('./generated-lib1.js').then(function (n) { return n.l; }).then(m => m.value3));
