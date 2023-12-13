(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.reexportsAliasingExternal = {}, global.d));
})(this, (function (exports, d) { 'use strict';

	Object.defineProperty(exports, "b", {
		enumerable: true,
		get: function () { return d.d; }
	});

}));
