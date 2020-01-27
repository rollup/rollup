import { v as value1 } from './generated-dep1.js';
export { v as value1 } from './generated-dep1.js';
import { v as value2 } from './generated-dep2.js';
export { v as value2 } from './generated-dep2.js';

const something = 'something';

console.log('main1', value1, value2, something);
import('./generated-dynamic.js');
