(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require(':do-not-sanitize')) :
	typeof define === 'function' && define.amd ? define([':do-not-sanitize'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.external));
}(this, (function (external) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

	console.log(external__default['default']);

})));
