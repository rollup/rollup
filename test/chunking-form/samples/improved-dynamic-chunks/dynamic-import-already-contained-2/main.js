import { value1 } from './dynamic1.js';
import { value2 } from './dynamic2.js';

import('./dynamic1.js').then(console.log);
console.log('main', value1, value2);
