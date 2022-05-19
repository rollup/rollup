const shared = true;

import('./generated-dynamic1.js').then(function (n) { return n.d; });
console.log(shared);

export { shared as s };
