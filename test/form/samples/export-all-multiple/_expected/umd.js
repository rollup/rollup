(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('foo'), require('bar'), require('baz')) :
	typeof define === 'function' && define.amd ? define(['exports', 'foo', 'bar', 'baz'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.myBundle = {}, global.foo, global.bar, global.baz));
})(this, (function (exports, foo, bar, baz) { 'use strict';

	Object.keys(foo).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return foo[k]; }
		});
	});
	Object.keys(bar).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return bar[k]; }
		});
	});
	Object.keys(baz).forEach(function (k) {
		if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () { return baz[k]; }
		});
	});

}));
