const shared = 'shared';

console.log(shared);
import('./generated-dynamic.js');
const unused = 42;

export { shared as s, unused as u };
