define(['external-all', 'external-default-namespace', 'external-named-namespace', 'external-namespace'], function (foo, quux, quux$1, bar) { 'use strict';

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
			var n = Object.create(null);
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
			return Object.freeze(n);
		}
	}

	var foo__ns = /*#__PURE__*/_interopNamespace(foo);
	var quux__ns = /*#__PURE__*/_interopNamespace(quux);
	var quux__ns$1 = /*#__PURE__*/_interopNamespace(quux$1);
	var bar__ns = /*#__PURE__*/_interopNamespace(bar);

	console.log(foo__ns, bar__ns, quux__ns, quux__ns$1);

});
