import { b } from 'external';

let a;

({a} = b);
console.log({a} = b);

import('external').then(console.log);

export { a };
