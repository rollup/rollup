(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('externalNoImport'), require('external'), require('externalAuto'), require('externalDefault'), require('externalDefaultOnly')) :
	typeof define === 'function' && define.amd ? define(['exports', 'externalNoImport', 'external', 'externalAuto', 'externalDefault', 'externalDefaultOnly'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
		var current = global.bundle;
		var exports = global.bundle = {};
		factory(exports, null, global.defaultLegacy, global.externalAuto, global.externalDefault, global.externalDefaultOnly);
		exports.noConflict = function () { global.bundle = current; return exports; };
	})());
})(this, (function (exports, externalNoImport, defaultLegacy, externalAuto, externalDefault, externalDefaultOnly) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	function _interopDefault (e) { return e && e.__esModule ? e : { 'default': e }; }

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, 'default': e }); }

	function _interopNamespaceDefault(e) {
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		}
		n["default"] = e;
		return Object.freeze(n);
	}

	function _interopNamespace (e) { return e && e.__esModule ? e : _interopNamespaceDefault(e); }

	function _mergeNamespaces(n, m) {
		m.forEach(function (e) {
			e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
				if (k !== 'default' && !(k in n)) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () { return e[k]; }
					});
				}
			});
		});
		return Object.freeze(n);
	}

	var defaultLegacy__namespace = /*#__PURE__*/_interopNamespace(defaultLegacy);
	var defaultLegacy__default = /*#__PURE__*/_interopDefaultLegacy(defaultLegacy);
	var externalAuto__default = /*#__PURE__*/_interopDefault(externalAuto);
	var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);
	var externalDefaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(externalDefaultOnly);

	exports.a = void 0;

	({ a: exports.a } = defaultLegacy.b);
	console.log({ a: exports.a } = defaultLegacy.b);

	Promise.resolve().then(function () { return main; }).then(console.log);

	import('external').then(console.log);
	console.log(defaultLegacy__default["default"]);
	console.log(externalAuto__default["default"]);
	console.log(externalDefault__namespace);
	console.log(externalDefaultOnly__namespace);

	var main = /*#__PURE__*/Object.freeze(/*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		get a () { return exports.a; },
		foo: foo
	}, [defaultLegacy__namespace]));

	Object.defineProperty(exports, 'foo', {
		enumerable: true,
		get: function () { return defaultLegacy.foo; }
	});
	Object.keys(defaultLegacy).forEach(function (k) {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return defaultLegacy[k]; }
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
