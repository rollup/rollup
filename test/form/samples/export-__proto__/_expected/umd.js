(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.x));
})(this, (function (exports, x$1) { 'use strict';

	const __proto__ = 1;

	var x = /*#__PURE__*/Object.freeze({
		__proto__: null,
		["__proto__"]: __proto__
	});

	Object.defineProperty(exports, "__proto__", {
		enumerable: true,
		value: __proto__
	});
	exports.x = x;
	Object.keys(x$1).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) k === '__proto__' ? Object.defineProperty(exports, k, {
			enumerable: true,
			value: x$1[k]
		}) : exports[k] = x$1[k];
	});

}));
