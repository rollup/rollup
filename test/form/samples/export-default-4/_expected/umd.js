(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, (global.my = global.my || {}, global.my.global = global.my.global || {}, global.my.global.namespace = factory()));
}(this, (function () { 'use strict';

	var main = 42;

	return main;

})));
