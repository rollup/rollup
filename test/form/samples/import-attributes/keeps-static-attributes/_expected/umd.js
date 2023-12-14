(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('a'), require('b'), require('c'), require('d'), require('unresolved')) :
	typeof define === 'function' && define.amd ? define(['exports', 'a', 'b', 'c', 'd', 'unresolved'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.a, global.b, global.c, global.d$1));
})(this, (function (exports, a, b, c, d$1) { 'use strict';

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

	console.log(a.a, b__namespace, d);

	Object.defineProperty(exports, "c", {
		enumerable: true,
		get: function () { return c.c; }
	});
	Object.keys(d$1).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return d$1[k]; }
		});
	});

}));
