(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('foo'), require('bar'), require('baz')) :
	typeof define === 'function' && define.amd ? define(['exports', 'foo', 'bar', 'baz'], factory) :
	(global = global || self, factory(global.myBundle = {}, global.foo, global.bar, global.baz));
}(this, function (exports, foo, bar, baz) { 'use strict';

	Object.keys(foo).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return foo[key];
			}
		});
	});
	Object.keys(bar).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return bar[key];
			}
		});
	});
	Object.keys(baz).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return baz[key];
			}
		});
	});

	Object.defineProperty(exports, '__esModule', { value: true });

}));
