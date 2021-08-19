System.register('bundle',['external'],((exports,module)=>{'use strict';var _starExcludes={a:1,'default':1,foo:1};var b;return{setters:[(module=>{b=module.b;var setter={foo:module.foo};for(var nameinmodule){if(!_starExcludes[name])setter[name]=module[name];}exports(setter);})],execute:(()=>{let a; exports('a',a);

(v=>(exports('a',a),v))({a} = b);
console.log((v=>(exports('a',a),v))({a} = b));

module.import('external').then(console.log);})}}));