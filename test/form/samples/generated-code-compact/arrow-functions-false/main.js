import {b} from 'external';
export let a;

null, {a} = b;
console.log({a} = b);

import('external').then(console.log);
export * from 'external';
export {foo} from 'external';
