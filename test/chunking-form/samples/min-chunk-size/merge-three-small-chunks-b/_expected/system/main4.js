System.register(['./generated-big.js', './generated-small1.js'], (function () {
	'use strict';
	var big, small1;
	return {
		setters: [function (module) {
			big = module.b;
		}, function (module) {
			small1 = module.s;
		}],
		execute: (function () {

			console.log(big, small1);

		})
	};
}));
