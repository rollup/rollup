const shared = 'shared';

console.log(shared);
import('./generated-dynamic4.js');
const unused = 42;

export { shared as s, unused };
