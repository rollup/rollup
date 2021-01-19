System.register(['./generated-m1.js', './m2.js'], function () {
	'use strict';
	var ms;
	return {
		setters: [function (module) {
			ms = module.m;
		}, function () {}],
		execute: function () {

			console.log(ms);

		}
	};
});
