System.register(['./other.js'], (function (exports) {
	'use strict';
	var other;
	return {
		setters: [function (module) {
			other = module;
		}],
		execute: (function () {

			var main = exports("default", other + "extended");

		})
	};
}));
