'use strict';

var a = require('a');
var b = require('b');
var c = require('c');

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

console.log(a.a, b.b);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefault(require('d')); }).then(console.log);

Object.defineProperty(exports, 'c', {
	enumerable: true,
	get: function () { return c.c; }
});
