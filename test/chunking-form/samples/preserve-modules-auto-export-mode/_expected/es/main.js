import foo from './default.js';
export { default } from './default.js';
import { value } from './named.js';

console.log(foo, value);

import('./default.js').then(result => console.log(result.default));
import('./named.js').then(result => console.log(result.value));
