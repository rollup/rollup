import { e } from './generated-e.js';

console.log('c5');
const c5 = 'c5' + e;

console.log('c4');
const c4 = 'c4' + c5;

export { c4 as c };
