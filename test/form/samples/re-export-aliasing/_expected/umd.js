(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd'], factory) :
	factory(global.reexportsAliasingExternal = {}, global.d);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports, d) { 'use strict';

	Object.defineProperty(exports, 'b', {
		enumerable: true,
		get: function () {
			return d.d;
		}
	});

	Object.defineProperty(exports, '__esModule', { value: true });

})));
