'use strict';

require('./direct-relative-external');
require('to-indirect-relative-external');
require('direct-absolute-external');
require('to-indirect-absolute-external');

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

// nested
Promise.resolve().then(function () { return existing; });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('./direct-relative-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('to-indirect-relative-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('direct-absolute-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('to-indirect-absolute-external')); });

const value = 'existing';
console.log('existing');

var existing = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value
});

//main
Promise.resolve().then(function () { return existing; });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('./direct-relative-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('to-indirect-relative-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('direct-absolute-external')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('to-indirect-absolute-external')); });

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('dynamic-direct-external' + unknown)); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('to-dynamic-indirect-external')); });
Promise.resolve().then(function () { return existing; });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('my' + 'replacement')); });
