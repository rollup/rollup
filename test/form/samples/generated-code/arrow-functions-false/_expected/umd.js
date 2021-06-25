(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}));
}(this, (function (exports) { 'use strict';

	exports.a = void 0;

	({a: exports.a} = someObject);
	console.log({a: exports.a} = someObject);

	Object.defineProperty(exports, '__esModule', { value: true });

})));
