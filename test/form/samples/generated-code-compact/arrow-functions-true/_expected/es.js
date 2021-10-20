import'externalNoImport';import*as defaultLegacy from'external';import defaultLegacy__default,{b}from'external';export*from'external';export{foo}from'external';import externalAuto from'externalAuto';import*as externalDefault from'externalDefault';import*as externalDefaultOnly from'externalDefaultOnly';function _mergeNamespaces(n, m){m.forEach(e=>e&&typeof e!=='string'&&!Array.isArray(e)&&Object.keys(e).forEach(k=>{if(k!=='default'&&!(k in n)){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:()=>e[k]});}}));return Object.freeze(n);}let a;

({ a } = b);
console.log({ a } = b);

Promise.resolve().then(()=>main).then(console.log);

import('external').then(console.log);
console.log(defaultLegacy__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);var main=/*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({__proto__:null,get a(){return a},foo:foo}, [defaultLegacy]));export{a};