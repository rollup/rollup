(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external1'), require('external2')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external1', 'external2'], factory) :
	(global = global || self, factory(global.iife = {}, global.external1, global.external2));
}(this, (function (exports, external1, external2) { 'use strict';

	Object.defineProperty(exports, 'x', {
		enumerable: true,
		get: function () {
			return external1.x;
		}
	});
	exports.ext = external2;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
