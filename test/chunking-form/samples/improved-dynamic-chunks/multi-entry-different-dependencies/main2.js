import { value2 } from './dep2.js';
// doesn't import value1, so we can't have also loaded value1?
console.log('main2', value2);
import('./dynamic.js');
export { value2 };
