define(['exports', 'external'], (function (exports, foo) { 'use strict';

	var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
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

	var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);
	var foo__namespace = /*#__PURE__*/_interopNamespace(foo);

	console.log(foo__default["default"], foo__namespace);

	Object.keys(foo).forEach(k => {
		if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: () => foo[k]
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
