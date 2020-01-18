import { value2 } from './dep2.js';
console.log('main2', value2);
import('./dynamic.js');
export { value2 };
