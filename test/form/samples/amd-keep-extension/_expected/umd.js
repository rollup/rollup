(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./foo'), require('baz/quux')) :
	typeof define === 'function' && define.amd ? define(['./foo.js', 'baz/quux'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo, global.baz));
})(this, (function (foo, baz) { 'use strict';

	const bar = 42;

	console.log(foo, bar, baz);

}));
