System.register(['./generated-lib1.js', './generated-vendor.js'], (function () {
	'use strict';
	var value1, value2, bar;
	return {
		setters: [function (module) {
			value1 = module.value1;
			value2 = module.value2;
		}, function (module) {
			bar = module.b;
		}],
		execute: (function () {

			console.log(value1);
			console.log(bar);
			console.log(value2);
			console.log(bar);

		})
	};
}));
