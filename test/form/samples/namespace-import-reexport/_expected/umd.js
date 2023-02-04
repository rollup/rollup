(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external-package')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external-package'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.iife = {}, global.externalPackage));
})(this, (function (exports, externalPackage) { 'use strict';

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

	var externalPackage__namespace = /*#__PURE__*/_interopNamespaceDefault(externalPackage);



	exports.ext = externalPackage__namespace;

}));
