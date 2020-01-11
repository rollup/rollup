const value1 = 'dep';

import('./generated-dynamic.js');
console.log('shared', value1);

export { value1 as v };
