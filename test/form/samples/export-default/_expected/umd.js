(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.myBundle = factory();
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function () { 'use strict';

	var main = 42;

	return main;

})));
