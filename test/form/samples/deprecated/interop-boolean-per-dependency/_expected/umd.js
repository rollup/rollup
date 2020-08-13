(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('external-false'), require('external-true')) :
	typeof define === 'function' && define.amd ? define(['external-false', 'external-true'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.externalfalse, global.externaltrue));
}(this, (function (fooFalse, fooTrue) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	function _interopNamespace(e) {
		if (e && e.__esModule) { return e; } else {
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
	}

	var fooTrue__default = /*#__PURE__*/_interopDefaultLegacy(fooTrue);
	var fooTrue__namespace = /*#__PURE__*/_interopNamespace(fooTrue);

	console.log(fooFalse, fooFalse.barFalse, fooFalse);
	console.log(fooTrue__default['default'], fooTrue.barTrue, fooTrue__namespace);

	import('external-false').then(console.log);
	import('external-true').then(console.log);

})));
