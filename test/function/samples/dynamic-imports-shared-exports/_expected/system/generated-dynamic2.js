System.register(['./generated-dynamic1.js', './main.js'], (function () {
	'use strict';
	var sharedDynamic;
	return {
		setters: [function (module) {
			sharedDynamic = module.s;
		}, function () {}],
		execute: (function () {

			console.log(sharedDynamic);

		})
	};
}));
