import { v as value2 } from './generated-dep2.js';
export { v as value2 } from './generated-dep2.js';

const value1 = 'shared1';

console.log('main1', value1, value2);
import('./generated-dynamic.js');

export { value1 };
