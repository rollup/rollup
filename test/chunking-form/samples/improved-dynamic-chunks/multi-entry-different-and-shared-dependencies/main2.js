import { value2 } from './from-all.js';
import { value3 } from './from-main-1-and-2.js';
console.log('main2', value2, value3);
import('./dynamic.js');
export { value2, value3 };
