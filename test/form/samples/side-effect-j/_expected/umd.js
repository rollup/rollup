(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.myBundle = factory();
}(typeof self !== 'undefined' ? self : this, function () { 'use strict';

	var augment;
	augment = x => x.augmented = true;

	function x () {}
	augment( x );

	return x;

}));
