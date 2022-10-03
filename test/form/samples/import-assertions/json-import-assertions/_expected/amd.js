define(['require', 'exports', './foo.json'], (function (require, exports, json) { 'use strict';

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

	console.log(json);

	new Promise(function (resolve, reject) { require(['./foo.json'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefault(m)); }, reject); }).then(console.log);

	exports.json = json;

}));
