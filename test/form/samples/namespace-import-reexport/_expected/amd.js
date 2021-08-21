define(['exports', 'external-package'], (function (exports, externalPackage) { 'use strict';

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
		n["default"] = e;
		return Object.freeze(n);
	}

	var externalPackage__namespace = /*#__PURE__*/_interopNamespace(externalPackage);



	exports.ext = externalPackage__namespace;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
