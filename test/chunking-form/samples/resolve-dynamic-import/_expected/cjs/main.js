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

require('./direct-relative-external');
require('to-indirect-relative-external');
require('direct-absolute-external');
require('to-indirect-absolute-external');

// nested
Promise.resolve().then(function () { return existing; });
new Promise(function (resolve) { resolve(_interopNamespace(require('./direct-relative-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('to-indirect-relative-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('direct-absolute-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('to-indirect-absolute-external'))); });

const value = 'existing';

var existing = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value
});

//main
Promise.resolve().then(function () { return existing; });
new Promise(function (resolve) { resolve(_interopNamespace(require('./direct-relative-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('to-indirect-relative-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('direct-absolute-external'))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('to-indirect-absolute-external'))); });

new Promise(function (resolve) { resolve(_interopNamespace(require('dynamic-direct-external' + unknown))); });
new Promise(function (resolve) { resolve(_interopNamespace(require('to-dynamic-indirect-external'))); });
Promise.resolve().then(function () { return existing; });
new Promise(function (resolve) { resolve(_interopNamespace(require('my' + 'replacement'))); });
