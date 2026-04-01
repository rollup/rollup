'use strict';

var a_type_a_extra_extra = require('a');
var b = require('b');
var c_type_c = require('c');
var d_type_d = require('d');
require('unresolved');

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

var b__namespace = /*#__PURE__*/_interopNamespaceDefault(b);

console.log(a_type_a_extra_extra.a, b__namespace, d);

Object.defineProperty(exports, "c", {
	enumerable: true,
	get: function () { return c_type_c.c; }
});
Object.keys(d_type_d).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return d_type_d[k]; }
	});
});
