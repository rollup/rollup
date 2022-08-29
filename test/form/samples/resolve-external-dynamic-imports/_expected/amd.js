define(['require', 'exports', 'external'], (function (require, exports, myExternal) { 'use strict';

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

	const test = () => myExternal;

	const someDynamicImport = () => new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefault(m)); }, reject); });

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

}));
