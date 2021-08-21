System.register('bundle',['external','externalAuto','externalDefault','externalDefaultOnly'],((exports,module)=>{'use strict';var _starExcludes={a:1,'default':1,foo:1};var b,defaultLegacy__default,externalAuto,externalDefault,externalDefaultOnly;return{setters:[(module=>{b=module.b;defaultLegacy__default=module["default"];var setter={foo:module.foo};for(var nameinmodule){if(!_starExcludes[name])setter[name]=module[name];}exports(setter);}),(module=>{externalAuto=module["default"];}),(module=>{externalDefault=module;}),(module=>{externalDefaultOnly=module;})],execute:(()=>{let a; exports('a',a);

(v=>(exports('a',a),v))({ a } = b);
console.log((v=>(exports('a',a),v))({ a } = b));

module.import('external').then(console.log);
console.log(defaultLegacy__default);
console.log(externalAuto);
console.log(externalDefault);
console.log(externalDefaultOnly);})}}));