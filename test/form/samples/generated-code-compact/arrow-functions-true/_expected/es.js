import defaultLegacy__default,{b}from'external';export*from'external';export{foo}from'external';import externalAuto from'externalAuto';import*as externalDefault from'externalDefault';import*as externalDefaultOnly from'externalDefaultOnly';let a;

({ a } = b);
console.log({ a } = b);

import('external').then(console.log);
console.log(defaultLegacy__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);export{a};