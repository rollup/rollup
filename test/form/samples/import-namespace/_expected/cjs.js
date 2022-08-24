'use strict';

var foo = require('foo');
var bar = require('bar');

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

var foo__namespace = /*#__PURE__*/_interopNamespaceDefault(foo);
var bar__namespace = /*#__PURE__*/_interopNamespaceDefault(bar);

foo__namespace.x();
console.log(bar__namespace);
