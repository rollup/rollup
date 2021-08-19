System.register('bundle',['external'],(function(exports,module){'use strict';var _starExcludes={a:1,'default':1,foo:1};var b;return{setters:[(function(module){b=module.b;var setter={foo:module.foo};for(var nameinmodule){if(!_starExcludes[name])setter[name]=module[name];}exports(setter);})],execute:(function(){let a; exports('a',a);

(function(v){return exports('a',a),v})({a} = b);
console.log(function(v){return exports('a',a),v}({a} = b));

module.import('external').then(console.log);})}}));