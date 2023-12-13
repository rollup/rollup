(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bundle = {}, global.external1, global.external2));
})(this, (function (exports, external1, external2) { 'use strict';

	Object.defineProperty(exports, "foo", {
		enumerable: true,
		get: function () { return external1.foo; }
	});
	Object.defineProperty(exports, "bar", {
		enumerable: true,
		get: function () { return external2.foo; }
	});

}));
