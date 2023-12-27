(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.x));
})(this, (function (exports, x) { 'use strict';

	Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: x.__proto__
	});

}));
