(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.foo = factory());
}(this, (function () { 'use strict';

	/* this is an intro */
	console.log( 'hello world' );

	var main = 42;

	return main;
	/* this is an outro */

})));
