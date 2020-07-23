(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo'), require('bar')) :
	typeof define === 'function' && define.amd ? define(['foo', 'bar'], factory) :
	factory(global.foo, global.bar);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (foo, bar) { 'use strict';

	console.log( bar.a );

	console.log( foo.a );

})));
