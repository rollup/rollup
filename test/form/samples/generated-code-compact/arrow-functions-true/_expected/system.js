System.register('bundle',['external','externalAuto','externalDefault','externalDefaultOnly'],((exports,module)=>{'use strict';var _starExcludes={a:1,'default':1,foo:1};var b,defaultLegacy,defaultLegacy__default,externalAuto,externalDefault,externalDefaultOnly;return{setters:[(module=>{b=module.b;defaultLegacy=module;defaultLegacy__default=module["default"];var setter={foo:module.foo};for(var nameinmodule){if(!_starExcludes[name])setter[name]=module[name];}exports(setter);}),(module=>{externalAuto=module["default"];}),(module=>{externalDefault=module;}),(module=>{externalDefaultOnly=module;})],execute:(()=>{let a; exports('a',a);

(v=>(exports('a',a),v))({ a } = b);
console.log((v=>(exports('a',a),v))({ a } = b));

Promise.resolve().then(()=>main).then(console.log);

module.import('external').then(console.log);
console.log(defaultLegacy__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);var main=/*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null),defaultLegacy,{get a(){return a},foo:foo}));})}}));