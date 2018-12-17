(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global = global || self, global.foo = factory(global.a));
}(this, function (a) { 'use strict';

	/* this is an intro */

	// intro 1

	// intro 2

	// intro 3

	// intro 4

	var a__default = 'default' in a ? a['default'] : a;

	console.log( a__default );
	console.log( a.b );

	var main = 42;

	return main;

	/* this is an outro */

	// outro 1

	// outro 2

	// outro 3

	// outro 4

}));
