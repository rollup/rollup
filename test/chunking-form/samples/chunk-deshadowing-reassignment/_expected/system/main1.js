System.register(['./main2.js', './main3.js', './main4.js'], (function () {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.x;
			y = module.y;
		}, null, null],
		execute: (function () {

			console.log(x + y);

		})
	};
}));
