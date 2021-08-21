((global, factory) => {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external'), require('externalAuto'), require('externalDefault'), require('externalDefaultOnly')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.defaultLegacy, global.externalAuto, global.externalDefault, global.externalDefaultOnly));
})(this, ((exports, defaultLegacy, externalAuto, externalDefault, externalDefaultOnly) => { 'use strict';

	var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

	var _interopDefault = e => e && e.__esModule ? e : { 'default': e };

	var _interopNamespaceDefaultOnly = e => Object.freeze({ __proto__: null, 'default': e });

	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(k => {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: () => e[k]
					});
				}
			});
		}
		n["default"] = e;
		return Object.freeze(n);
	}

	var defaultLegacy__default = /*#__PURE__*/_interopDefaultLegacy(defaultLegacy);
	var externalAuto__default = /*#__PURE__*/_interopDefault(externalAuto);
	var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);
	var externalDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);

	exports.a = void 0;

	({ a: exports.a } = defaultLegacy.b);
	console.log({ a: exports.a } = defaultLegacy.b);

	import('external').then(console.log);
	console.log(defaultLegacy__default["default"]);
	console.log(externalAuto__default["default"]);
	console.log(externalDefault__namespace);
	console.log(externalDefaultOnly__namespace);

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: () => defaultLegacy.foo
	});
	Object.keys(defaultLegacy).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => defaultLegacy[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
