(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('foo')) :
	typeof define === 'function' && define.amd ? define(['foo'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.foo));
})(this, (function (foo) { 'use strict';

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

	console.log(foo__namespace);
	console.log(foo.blah);
	console.log(foo.bar);

}));
