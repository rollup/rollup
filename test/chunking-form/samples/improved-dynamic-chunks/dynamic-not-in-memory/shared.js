import { value1 } from './dep.js';
import('./dynamic.js');
console.log('shared', value1);
