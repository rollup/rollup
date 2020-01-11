import { value1 } from './dep1.js';
import { value2 } from './dep2.js';
import { something } from './only-from-main-1.js';
console.log('main1', value1, value2, something);
import('./dynamic.js');
export { value1, value2 };
