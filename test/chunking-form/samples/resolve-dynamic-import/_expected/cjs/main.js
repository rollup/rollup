'use strict';

require('./direct-relative-external');
require('to-indirect-relative-external');
require('direct-absolute-external');
require('to-indirect-absolute-external');

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

// nested
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

const value = 'existing';
console.log('existing');

var existing = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value
});

//main
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

(function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require(t)); }); })('dynamic-direct-external' + unknown);
import('to-dynamic-indirect-external');
Promise.resolve().then(function () { return existing; });
(function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require(t)); }); })('my' + 'replacement');
