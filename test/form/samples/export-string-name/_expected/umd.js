(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.x));
})(this, (function (exports, x) { 'use strict';

	const y = 1;

	function a () {}
	function b () {}

	exports["'x"] = x.x;
	exports["'a"] = a;
	exports["'b"] = b;
	exports["'y"] = y;

}));
