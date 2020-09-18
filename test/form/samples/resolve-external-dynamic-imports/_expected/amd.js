define(['require', 'exports', 'external'], function (require, exports, myExternal) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) {
			Object.keys(e).forEach(function (k) {
				if (k !== 'default') {
					var d = Object.getOwnPropertyDescriptor(e, k);
					Object.defineProperty(n, k, d.get ? d : {
						enumerable: true,
						get: function () {
							return e[k];
						}
					});
				}
			});
		}
		n['default'] = e;
		return Object.freeze(n);
	}

	var myExternal__default = /*#__PURE__*/_interopDefaultLegacy(myExternal);

	const test = () => myExternal__default['default'];

	const someDynamicImport = () => new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject) });

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

});
