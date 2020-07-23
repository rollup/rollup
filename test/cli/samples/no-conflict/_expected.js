(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, (function () {
		var current = global.conflictyName;
		var exports = global.conflictyName = factory();
		exports.noConflict = function () { global.conflictyName = current; return exports; };
	}()));
}(this, (function () { 'use strict';

	var main = {};

	return main;

})));