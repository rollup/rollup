import { value1 } from './from-main-1-and-dynamic.js';
import { value2 } from './from-all.js';
import { value3 } from './from-main-1-and-2.js';
console.log('main1', value1, value2, value3);
import('./dynamic.js');
export { value1, value2, value3 };
