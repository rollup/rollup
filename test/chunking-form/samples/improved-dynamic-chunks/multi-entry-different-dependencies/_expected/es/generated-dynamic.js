import { value1 } from './main1.js';
export { value1 } from './main1.js';
import { v as value2 } from './generated-dep2.js';
export { v as value2 } from './generated-dep2.js';

console.log('dynamic1', value1, value2);
