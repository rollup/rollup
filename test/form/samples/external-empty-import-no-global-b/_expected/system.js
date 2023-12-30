System.register('myBundle', ['babel-polyfill', 'other'], (function (exports) {
	'use strict';
	var x;
	return {
		setters: [null, function (module) {
			x = module.x;
		}],
		execute: (function () {

			x();

			var main = exports("default", new WeakMap());

		})
	};
}));
