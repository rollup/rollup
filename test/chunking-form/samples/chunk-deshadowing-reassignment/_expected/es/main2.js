import { x as x$1 } from './main3.js';
import { x as x$2 } from './main4.js';

var x = x$1 + 1;
console.log('shared1');

var y = x$2 + 1;
console.log('shared2');

export { x, y };
