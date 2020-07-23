(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('core/view')) :
	typeof define === 'function' && define.amd ? define(['core/view'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.foo = factory(global.View));
}(this, (function (View) { 'use strict';

	var main = View.extend({});

	return main;

})));
