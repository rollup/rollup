System.register(['./generated-dep2.js', './generated-dep3.js'], (function () {
	'use strict';
	var num, num$1;
	return {
		setters: [function (module) {
			num = module.n;
		}, function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			console.log(num + num$1);

		})
	};
}));
