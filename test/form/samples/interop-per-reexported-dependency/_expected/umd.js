(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external-auto'), require('external-default'), require('external-defaultOnly'), require('external-esModule')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external-auto', 'external-default', 'external-defaultOnly', 'external-esModule'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.externalauto, global.externaldefault, global.externaldefaultOnly, global.externalesModule));
})(this, (function (exports, externalAuto, externalDefault, externalDefaultOnly, externalEsModule) { 'use strict';

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
		n.default = e;
		return Object.freeze(n);
	}

	function _interopNamespace (e) { return e && e.__esModule ? e : _interopNamespaceDefault(e); }

	var externalAuto__namespace = /*#__PURE__*/_interopNamespace(externalAuto);
	var externalDefault__namespace = /*#__PURE__*/_interopNamespaceDefault(externalDefault);



	Object.defineProperty(exports, "barAuto", {
		enumerable: true,
		get: function () { return externalAuto.barAuto; }
	});
	exports.externalAuto = externalAuto__namespace;
	Object.defineProperty(exports, "fooAuto", {
		enumerable: true,
		get: function () { return externalAuto__namespace.default; }
	});
	Object.defineProperty(exports, "barDefault", {
		enumerable: true,
		get: function () { return externalDefault.barDefault; }
	});
	exports.externalDefault = externalDefault__namespace;
	exports.fooDefault = externalDefault;
	exports.fooDefaultOnly = externalDefaultOnly;
	Object.defineProperty(exports, "barEsModule", {
		enumerable: true,
		get: function () { return externalEsModule.barEsModule; }
	});
	exports.externalEsModule = externalEsModule;
	Object.defineProperty(exports, "fooEsModule", {
		enumerable: true,
		get: function () { return externalEsModule.default; }
	});

}));
