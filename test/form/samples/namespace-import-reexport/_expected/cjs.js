'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var externalPackage = require('external-package');

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

var externalPackage__ns = /*#__PURE__*/_interopNamespace(externalPackage);



exports.ext = externalPackage__ns;
