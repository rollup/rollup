const value = 42;

console.log(value);
import('./generated-dynamicDep.js');
const dep = 'dep';

export { dep as d, value as v };
