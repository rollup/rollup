(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.my = global.my || {}, global.my.global = global.my.global || {}, global.my.global.namespace = factory());
}(typeof globalThis !== 'undefined' ? globalThis : this || self, (function () { 'use strict';

	var main = 42;

	return main;

})));
