import foo from './default.js';
import { value } from './named.js';
console.log(foo, value);

export { default } from './default.js';

import('./default').then(result => console.log(result.default));
import('./named').then(result => console.log(result.value));
