(function (global, factory) {
	typeof module === 'object' && module.exports ? factory(exports, require('d')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd'], factory) :
	(factory((global.reexportsAliasingExternal = {}),global.d));
}(this, (function (exports,d) { 'use strict';

	exports.b = d.d;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
