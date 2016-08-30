(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global.foo = factory(global.a));
}(this, (function (a) { 'use strict';

	/* this is an intro */
	var a__default = 'default' in a ? a['default'] : a;

	console.log( a__default );
	console.log( a.b );

	var main = 42;

	return main;
	/* this is an outro */

})));
