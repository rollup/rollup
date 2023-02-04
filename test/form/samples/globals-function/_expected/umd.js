(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('a'), require('b')) :
	typeof define === 'function' && define.amd ? define(['a', 'b'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.thisIsA, global.thisIsB));
})(this, (function (a, b) { 'use strict';

	console.log(a, b);

}));
