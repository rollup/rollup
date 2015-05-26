(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.myBundle = factory();
}(this, function () { 'use strict';

	var main = 42;

	return main;

}));
