'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external1 = require('external1');
var external2 = require('external2');

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

var external2__namespace = /*#__PURE__*/_interopNamespace(external2);



Object.defineProperty(exports, 'x', {
	enumerable: true,
	get: function () {
		return external1.x;
	}
});
exports.ext = external2__namespace;
