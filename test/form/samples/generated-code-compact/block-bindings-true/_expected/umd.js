(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports,require('external')):typeof define==='function'&&define.amd?define(['exports','external'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,(()=>{const current=g.bundle;const e=g.bundle={};f(e,g.foo$1);e.noConflict=()=>{g.bundle=current;return e};})());})(this,(function(exports,foo$1){'use strict';const _interopDefaultLegacy=e=>e&&typeof e==='object'&&'default'in e?e:{'default':e};function _interopNamespace(e){if(e&&e.__esModule)return e;const n=Object.create(null);if(e){Object.keys(e).forEach(k=>{if(k!=='default'){const d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:()=>e[k]});}});}n["default"]=e;return Object.freeze(n);}const foo__default=/*#__PURE__*/_interopDefaultLegacy(foo$1);const foo__namespace=/*#__PURE__*/_interopNamespace(foo$1);const _missingExportShim=void 0;const foo = 'bar';const other=/*#__PURE__*/Object.freeze({__proto__:null,foo:foo,missing:_missingExportShim});console.log(foo__default["default"], foo__namespace, other, bar, _missingExportShim);
const main = 42;exports["default"]=main;Object.keys(foo$1).forEach(k=>{if(k!=='default'&&!exports.hasOwnProperty(k))Object.defineProperty(exports,k,{enumerable:true,get:()=>foo$1[k]})});Object.defineProperty(exports,'__esModule',{value:true});}));