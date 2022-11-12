System.register(['./generated-big.js', './generated-small3.js'], (function () {
	'use strict';
	var big, small1, small2;
	return {
		setters: [function (module) {
			big = module.b;
		}, function (module) {
			small1 = module.s;
			small2 = module.a;
		}],
		execute: (function () {

			console.log(big, small1, small2);

		})
	};
}));
