import { value1 } from './dep1.js';
import { value2 } from './dep2.js';
console.log('main1', value1, value2);
import('./dynamic1.js');
export { value1, value2 };
