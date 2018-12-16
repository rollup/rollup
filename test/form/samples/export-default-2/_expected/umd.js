(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.myBundle = factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	var bar = 1;

	return bar;

}));
