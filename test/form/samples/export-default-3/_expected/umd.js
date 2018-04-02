(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' && !module.nodeType ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.myBundle = factory());
}(this, (function () { 'use strict';

	var bar = 1;

	return bar;

})));
