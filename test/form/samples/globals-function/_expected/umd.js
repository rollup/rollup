(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('a'), require('b')) :
	typeof define === 'function' && define.amd ? define(['a', 'b'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.thisIsA, global.thisIsB));
})(this, (function (a, b) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

	var a__default = /*#__PURE__*/_interopDefaultLegacy(a);
	var b__default = /*#__PURE__*/_interopDefaultLegacy(b);

	console.log(a__default.default, b__default.default);

}));
