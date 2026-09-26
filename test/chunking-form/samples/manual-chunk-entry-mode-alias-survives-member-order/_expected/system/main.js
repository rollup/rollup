System.register(['./generated-vendor.js'], (function () {
	'use strict';
	var x, m;
	return {
		setters: [function (module) {
			x = module.x;
			m = module.m;
		}],
		execute: (function () {

			console.log(x, m);

		})
	};
}));
