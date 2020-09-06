'use strict';

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = Object.defineProperty(Object.create(null), '__esModule', { value: true });
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
}

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('./foo.js')); });
