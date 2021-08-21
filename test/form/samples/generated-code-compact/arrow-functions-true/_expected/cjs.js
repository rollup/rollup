'use strict';Object.defineProperty(exports,'__esModule',{value:true});var defaultLegacy=require('external'),externalAuto=require('externalAuto'),externalDefault=require('externalDefault'),externalDefaultOnly=require('externalDefaultOnly');var _interopDefaultLegacy=e=>e&&typeof e==='object'&&'default'in e?e:{'default':e};var _interopDefault=e=>e&&e.__esModule?e:{'default':e};var _interopNamespaceDefaultOnly=e=>Object.freeze({__proto__:null,'default':e});function _interopNamespaceDefault(e){var n=Object.create(null);if(e){Object.keys(e).forEach(k=>{if(k!=='default'){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:()=>e[k]});}});}n["default"]=e;return Object.freeze(n);}var _interopNamespace=e=>e&&e.__esModule?e:_interopNamespaceDefault(e);var defaultLegacy__default=/*#__PURE__*/_interopDefaultLegacy(defaultLegacy);var externalAuto__default=/*#__PURE__*/_interopDefault(externalAuto);var externalDefault__namespace=/*#__PURE__*/_interopNamespaceDefault(externalDefault);var externalDefaultOnly__namespace=/*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);exports.a=void 0;

({ a: exports.a } = defaultLegacy.b);
console.log({ a: exports.a } = defaultLegacy.b);

Promise.resolve().then(()=>/*#__PURE__*/_interopNamespace(require('external'))).then(console.log);
console.log(defaultLegacy__default["default"]);
console.log(externalAuto__default["default"]);
console.log(externalDefault__namespace);
console.log(externalDefaultOnly__namespace);Object.defineProperty(exports,'foo',{enumerable:true,get:()=>defaultLegacy.foo});Object.keys(defaultLegacy).forEach(k=>{if(k!=='default'&&!exports.hasOwnProperty(k))Object.defineProperty(exports,k,{enumerable:true,get:()=>defaultLegacy[k]})});