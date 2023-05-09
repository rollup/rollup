System.register(['./main2.js', './main4.js', './main3.js'], (function () {
	'use strict';
	var x;
	return {
		setters: [null, function (module) {
			x = module.x;
		}, null],
		execute: (function () {

			console.log('1');

			console.log(x);

		})
	};
}));
