import { v as value1 } from './generated-from-main-1-and-dynamic.js';
export { v as value1 } from './generated-from-main-1-and-dynamic.js';
import { v as value2, a as value3 } from './generated-from-main-1-and-2.js';
export { v as value2, a as value3 } from './generated-from-main-1-and-2.js';

console.log('main1', value1, value2, value3);
import('./generated-dynamic.js');
