define(['exports', 'external1', 'external2'], (function (exports, external1, external2) { 'use strict';

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

	var external2__namespace = /*#__PURE__*/_interopNamespaceDefault(external2);



	Object.defineProperty(exports, "x", {
		enumerable: true,
		get: function () { return external1.x; }
	});
	exports.ext = external2__namespace;

}));
