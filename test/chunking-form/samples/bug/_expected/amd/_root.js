define(['./_freeGlobal.js'], function (___freeGlobal_js) { 'use strict';

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = ___freeGlobal_js.default || freeSelf || Function('return this')();

	return root;

});
