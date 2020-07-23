(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external1, global.external2));
}(this, (function (exports, external1, external2) { 'use strict';

	var reexportExternal = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1));

	const extra = 'extra';

	const override = 'override';
	var reexportExternalsWithOverride = { synthetic: 'synthetic' };

	var reexportExternalsWithOverride$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), external1, external2, reexportExternalsWithOverride, {
		override: override,
		'default': reexportExternalsWithOverride,
		extra: extra
	}));

	exports.external = reexportExternal;
	exports.externalOverride = reexportExternalsWithOverride$1;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
