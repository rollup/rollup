'use strict';

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
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
		return n;
	}
}

Promise.resolve().then(function () { return _interopNamespace(require(`${globalThis.unknown}`)); });
Promise.resolve().then(function () { return _interopNamespace(require(`My ${globalThis.unknown}`)); });
Promise.resolve().then(function () { return _interopNamespace(require('./seven.js')); });
Promise.resolve().then(function () { return _interopNamespace(require('./seven.js')); });
