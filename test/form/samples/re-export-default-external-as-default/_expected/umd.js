(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = global || self, factory(global.reexportsDefaultExternalAsDefault = {}, global.external));
}(this, function (exports, external) { 'use strict';

	var external__default = 'default' in external ? external['default'] : external;



	Object.keys(external).forEach(function (key) { exports[key] = external[key]; });
	exports.default = external__default;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
