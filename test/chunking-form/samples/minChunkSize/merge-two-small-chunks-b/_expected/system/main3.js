System.register(['./generated-big.js', './generated-small2.js'], (function () {
	'use strict';
	var big, small2;
	return {
		setters: [function (module) {
			big = module.b;
		}, function (module) {
			small2 = module.s;
		}],
		execute: (function () {

			console.log(big, small2);

		})
	};
}));
