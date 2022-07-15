(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external));
})(this, (function (exports, external) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

	var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

	console.log('main');

	Object.defineProperty(exports, 'value', {
		enumerable: true,
		get: function () { return external__default.default; }
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
