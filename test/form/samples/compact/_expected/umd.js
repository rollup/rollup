(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?module.exports=factory(require('external')):typeof define==='function'&&define.amd?define(['external'],factory):(global.foo=factory(global.x));}(this,(function(x){'use strict';x=x&&x.hasOwnProperty('default')?x['default']:x;function foo () {
	console.log( x );
}return foo;})));