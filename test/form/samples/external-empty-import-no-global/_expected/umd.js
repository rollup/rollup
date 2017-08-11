(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-polyfill')) :
	typeof define === 'function' && define.amd ? define(['babel-polyfill'], factory) :
	(global.myBundle = factory());
}(this, (function () { 'use strict';

	var main = new WeakMap();

	return main;

})));
