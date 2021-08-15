(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
})(this, (function (exports) { 'use strict';

	const a = window.config ? 1 : 2;
	const b = 1 ;
	const c = 2;

	exports.a = a;
	exports.b = b;
	exports.c = c;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
