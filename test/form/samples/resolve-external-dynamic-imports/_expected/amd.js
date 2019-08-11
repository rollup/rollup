define(['require', 'exports', 'external'], function (require, exports, myExternal) { 'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
			var n = {};
			if (e) {
				Object.keys(e).forEach(function (k) {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				});
			}
			n['default'] = e;
			return n;
		}
	}

	myExternal = myExternal && myExternal.hasOwnProperty('default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(_interopNamespace(m)); }, reject) });

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

});
