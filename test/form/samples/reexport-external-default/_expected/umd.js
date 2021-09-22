(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['external1', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory(global.external1, global.external2));
})(this, (function (external1, external2) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var external2__default = /*#__PURE__*/_interopDefaultLegacy(external2);

	console.log(external1.foo);

	return external2__default["default"];

}));
