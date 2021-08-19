((g,f)=>{typeof exports==='object'&&typeof module!=='undefined'?f(exports,require('external')):typeof define==='function'&&define.amd?define(['exports','external'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.bundle={},g.external));})(this,((exports,external)=>{'use strict';exports.a=void 0;

({a: exports.a} = external.b);
console.log({a: exports.a} = external.b);

import('external').then(console.log);Object.defineProperty(exports,'foo',{enumerable:true,get:()=>external.foo});Object.keys(external).forEach(k=>{if(k!=='default'&&!exports.hasOwnProperty(k))Object.defineProperty(exports,k,{enumerable:true,get:()=>external[k]})});Object.defineProperty(exports,'__esModule',{value:true});}));