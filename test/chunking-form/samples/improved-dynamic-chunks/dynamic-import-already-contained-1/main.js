import { value1 } from './dep1.js';
import { value2 } from './dep2.js';

import('./main.js').then(console.log);
console.log('main', value1, value2);
export const value = 'main';
