(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external'), require('externalDefaultOnly'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external', 'externalDefaultOnly', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external, global.defaultOnly, global.someDefault));
})(this, (function (exports, external, defaultOnly, someDefault) { 'use strict';

	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	function _interopNamespaceDefaultOnly (e) { return Object.freeze({ __proto__: null, default: e }); }

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
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
		n.default = e;
		return Object.freeze(n);
	}

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

	var external__namespace = /*#__PURE__*/_interopNamespace(external);
	var defaultOnly__namespace = /*#__PURE__*/_interopNamespaceDefaultOnly(defaultOnly);
	var someDefault__default = /*#__PURE__*/_interopDefault(someDefault);

	var other = {
		foo: 'bar'
	};

	var ns = /*#__PURE__*/_mergeNamespaces({
		__proto__: null,
		default: other
	}, [other]);

	console.log(ns, other.foo, other.function, other["some-prop"], external.function, someDefault__default.default, defaultOnly__namespace);
	console.log(undefined, undefined);

	exports.function = 1;
	exports.function++;

	Object.defineProperty(exports, "bar", {
		enumerable: true,
		get: function () { return external.function; }
	});
	exports.default = external__namespace;
	Object.defineProperty(exports, "void", {
		enumerable: true,
		get: function () { return external__namespace.default; }
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
