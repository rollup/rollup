(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports):typeof define==='function'&&define.amd?define(['exports'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.foo={}));})(this,(function(exports){'use strict';exports.x = 42;
exports.x+=1;
exports.x=exports.x+1;
exports.x++;
++exports.x;}));