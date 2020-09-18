define(['external-all', 'external-default-namespace', 'external-named-namespace', 'external-namespace'], function (foo, quux, quux$1, bar) { 'use strict';

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

	var foo__namespace = /*#__PURE__*/_interopNamespace(foo);
	var quux__namespace = /*#__PURE__*/_interopNamespace(quux);
	var quux__namespace$1 = /*#__PURE__*/_interopNamespace(quux$1);
	var bar__namespace = /*#__PURE__*/_interopNamespace(bar);

	console.log(foo__namespace, bar__namespace, quux__namespace, quux__namespace$1);

});
