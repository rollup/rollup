'use strict';

var externalAll = require('external-all');
var externalNamespace$1 = require('external-namespace');
var externalDefaultNamespace = require('external-default-namespace');
var externalNamedNamespace = require('external-named-namespace');

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

var externalAll__namespace = /*#__PURE__*/_interopNamespaceCompat(externalAll);
var externalNamespace__namespace = /*#__PURE__*/_interopNamespaceCompat(externalNamespace$1);
var externalDefaultNamespace__namespace = /*#__PURE__*/_interopNamespaceCompat(externalDefaultNamespace);
var externalNamedNamespace__namespace = /*#__PURE__*/_interopNamespaceCompat(externalNamedNamespace);

const externalNamespace = 1;
const externalNamespace__ns = 1;
console.log(externalNamespace, externalNamespace__ns);

exports.foo = externalAll__namespace;
exports.bar = externalNamespace__namespace;
exports.baz = externalDefaultNamespace__namespace;
exports.quux = externalNamedNamespace__namespace;
