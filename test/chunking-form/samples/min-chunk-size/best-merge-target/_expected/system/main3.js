System.register(['./generated-small3.js', './generated-small4.js'], (function () {
	'use strict';
	var small1, small3, small2;
	return {
		setters: [function (module) {
			small1 = module.s;
			small3 = module.a;
		}, function (module) {
			small2 = module.s;
		}],
		execute: (function () {

			console.log(small1, small2, small3);

		})
	};
}));
