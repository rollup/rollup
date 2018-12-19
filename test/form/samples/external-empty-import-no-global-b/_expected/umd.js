(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-polyfill'), require('other')) :
	typeof define === 'function' && define.amd ? define(['babel-polyfill', 'other'], factory) :
	(global = global || self, global.myBundle = factory(null, global.other));
}(this, function (babelPolyfill, other) { 'use strict';

	other.x();

	var main = new WeakMap();

	return main;

}));
