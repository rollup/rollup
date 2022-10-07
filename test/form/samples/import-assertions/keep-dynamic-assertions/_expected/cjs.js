'use strict';

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

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('external')); });
(function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require(t)); }); })(globalThis.unknown);
(function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require(t)); }); })('resolvedString');
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('resolved-id')); });
Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('resolved-different')); });