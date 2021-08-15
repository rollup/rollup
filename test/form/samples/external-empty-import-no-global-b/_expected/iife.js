var myBundle = (function (babelPolyfill, other) {
	'use strict';

	other.x();

	var main = new WeakMap();

	return main;

})(null, other);
