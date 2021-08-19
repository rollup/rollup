import {b}from'external';export*from'external';export{foo}from'external';let a;

({a} = b);
console.log({a} = b);

import('external').then(console.log);export{a};