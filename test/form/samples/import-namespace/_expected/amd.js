define(['foo', 'bar'], (function (foo, bar) { 'use strict';

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
		n.default = e;
		return Object.freeze(n);
	}

	var foo__namespace = /*#__PURE__*/_interopNamespace(foo);
	var bar__namespace = /*#__PURE__*/_interopNamespace(bar);

	foo__namespace.x();
	console.log(bar__namespace);

}));
