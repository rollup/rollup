(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.iife = {}));
}(this, (function (exports) { 'use strict';

	var self = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
		__proto__: null,
		[Symbol.toStringTag]: 'Module',
		get p () { return p; }
	}, '__esModule', { value: true }));

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
