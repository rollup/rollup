(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	factory(global.bundle = {}, global.external);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (exports, external) { 'use strict';

	external = external && Object.prototype.hasOwnProperty.call(external, 'default') ? external['default'] : external;

	console.log('main');

	exports.value = external;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
