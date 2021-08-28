define(['require', 'external'], (function (require, external) { 'use strict';

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

	(function (t) { return new Promise(function (resolve, reject) { require([t], function (m) { resolve(/*#__PURE__*/_interopNamespace(m)); }, reject); }); })(external.join('a', 'b'));
	console.log(external.join);

}));
