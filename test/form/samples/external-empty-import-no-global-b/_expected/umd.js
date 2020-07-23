(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-polyfill'), require('other')) :
	typeof define === 'function' && define.amd ? define(['babel-polyfill', 'other'], factory) :
	global.myBundle = factory(null, global.other);
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function (babelPolyfill, other) { 'use strict';

	other.x();

	var main = new WeakMap();

	return main;

})));
