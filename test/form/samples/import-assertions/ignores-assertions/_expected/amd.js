define(['require', 'exports', 'a', 'b', 'c'], (function (require, exports, a, b, c) { 'use strict';

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

	console.log(a.a, b.b);

	new Promise(function (resolve, reject) { require(['d'], function (m) { resolve(/*#__PURE__*/_interopNamespaceDefault(m)); }, reject); }).then(console.log);

	Object.defineProperty(exports, 'c', {
		enumerable: true,
		get: function () { return c.c; }
	});

}));
