System.register('bundle',['externalNoImport','external','externalAuto','externalDefault','externalDefaultOnly'],(function(exports,module){'use strict';var _starExcludes={__proto__:null,a:1,default:1,foo:1};var b,defaultCompat__default,defaultCompat,externalAuto,externalDefault,externalDefaultOnly;return{setters:[()=>{},module=>{b=module.b;defaultCompat__default=module.default;defaultCompat=module;var setter={__proto__:null,foo:module.foo};for(var name in module){if(!_starExcludes[name])setter[name]=module[name];}exports(setter);},module=>{externalAuto=module.default;},module=>{externalDefault=module;},module=>{externalDefaultOnly=module;}],execute:(function(){function _mergeNamespaces(n, m){m.forEach(e=>e&&typeof e!=='string'&&!Array.isArray(e)&&Object.keys(e).forEach(k=>{if(k!=='default'&&!(k in n)){var d=Object.getOwnPropertyDescriptor(e,k);Object.defineProperty(n,k,d.get?d:{enumerable:true,get:()=>e[k]});}}));return Object.freeze(n);}let a; exports("a",a);

(v=>(exports("a",a),v))({ a } = b);
console.log((v=>(exports("a",a),v))({ a } = b));

Promise.resolve().then(()=>main).then(console.log);

module.import('external').then(console.log);
console.log(defaultCompat__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);var main=/*#__PURE__*/_mergeNamespaces({__proto__:null,get a(){return a},foo:foo},[defaultCompat]);})}}));