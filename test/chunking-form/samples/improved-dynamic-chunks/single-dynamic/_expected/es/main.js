const value = 'shared';

console.log('main', value);
import('./generated-dynamic.js');

export { value };
