(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = global || self, factory(global.bundle = {}, global.external));
}(this, (function (exports, external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
