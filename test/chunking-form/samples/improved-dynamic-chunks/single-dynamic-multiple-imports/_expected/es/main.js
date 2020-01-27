const value = 'shared';

console.log('a', value);
import('./generated-dynamic.js');

console.log('main', value);
import('./generated-dynamic.js');

export { value };
