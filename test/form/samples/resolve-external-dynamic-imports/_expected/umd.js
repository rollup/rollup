(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.myExternal));
}(this, (function (exports, myExternal) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var myExternal__default = /*#__PURE__*/_interopDefaultLegacy(myExternal);

	const test = () => myExternal__default['default'];

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
