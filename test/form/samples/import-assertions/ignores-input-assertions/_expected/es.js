import { a } from 'a';
import { b } from 'b';
export { c } from 'c';

console.log(a, b);

import('d').then(console.log);
