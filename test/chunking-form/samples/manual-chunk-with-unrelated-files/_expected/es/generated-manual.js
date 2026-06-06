import { d as dep, a as dep$1 } from './generated-dep2.js';

console.log('manual1');
const manual$1 = 'manual1:' + dep;

console.log('manual2');
const manual = 'manual2:' + dep$1;

export { manual as a, manual$1 as m };
