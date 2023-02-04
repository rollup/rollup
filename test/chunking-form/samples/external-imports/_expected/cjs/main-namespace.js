'use strict';

var foo = require('external-all');
var bar = require('external-namespace');
var quux = require('external-default-namespace');
var quux$1 = require('external-named-namespace');

function _interopNamespaceCompat(e) {
	if (e && typeof e === 'object' && 'default' in e) return e;
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

var foo__namespace = /*#__PURE__*/_interopNamespaceCompat(foo);
var bar__namespace = /*#__PURE__*/_interopNamespaceCompat(bar);
var quux__namespace = /*#__PURE__*/_interopNamespaceCompat(quux);
var quux__namespace$1 = /*#__PURE__*/_interopNamespaceCompat(quux$1);

console.log(foo__namespace, bar__namespace, quux__namespace, quux__namespace$1);
