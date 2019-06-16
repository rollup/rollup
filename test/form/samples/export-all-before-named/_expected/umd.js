(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = global || self, factory(global.exposedInternals = {}, global.external));
}(this, function (exports, external) { 'use strict';

	function internalFn(path) {
		return path[0] === '.';
	}

	Object.keys(external).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return external[key];
			}
		});
	});
	exports.internalFn = internalFn;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
