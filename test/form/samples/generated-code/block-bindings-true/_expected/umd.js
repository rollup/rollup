(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.foo));
})(this, (function (exports, foo) { 'use strict';

	const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

	const foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

	console.log(foo__default["default"]);

	Object.keys(foo).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => foo[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
