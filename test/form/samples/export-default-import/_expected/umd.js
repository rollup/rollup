(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('x')) :
	typeof define === 'function' && define.amd ? define(['exports', 'x'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}, global.x));
})(this, (function (exports, x) { 'use strict';

	function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

	var x__default = /*#__PURE__*/_interopDefaultCompat(x);



	Object.defineProperty(exports, "x", {
		enumerable: true,
		get: function () { return x__default.default; }
	});

}));
