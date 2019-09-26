(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?module.exports=f(require('external')):typeof define==='function'&&define.amd?define(['external'],f):(g=g||self,g.foo=f(g.x));}(this,function(x){'use strict';x=x&&x.hasOwnProperty('default')?x['default']:x;var self=/*#__PURE__*/Object.freeze({[Symbol.toStringTag]:'Module',get default(){return foo}});console.log(self);
function foo () {
	console.log( x );
}
// trailing comment
return foo;}));