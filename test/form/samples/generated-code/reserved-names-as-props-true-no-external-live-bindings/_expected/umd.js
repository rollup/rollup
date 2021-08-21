(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('external')) :
	typeof define === 'function' && define.amd ? define(['external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ns));
})(this, (function (ns) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

	var ns__default = /*#__PURE__*/_interopDefaultLegacy(ns);

	console.log(ns__default);

}));
