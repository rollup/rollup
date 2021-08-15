define(['babel-polyfill', 'other'], (function (babelPolyfill, other) { 'use strict';

	other.x();

	var main = new WeakMap();

	return main;

}));
