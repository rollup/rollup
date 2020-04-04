(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.iife = {}));
}(this, (function (exports) { 'use strict';

	var self = /*#__PURE__*/Object.freeze({
		__proto__: null,
		[Symbol.toStringTag]: 'Module',
		get p () { return p; }
	});

	console.log(Object.keys(self));

	var p = 5;

	exports.p = p;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
