System.register(['./generated-small2.js', './generated-small4.js'], (function () {
	'use strict';
	var small1, small2, small3;
	return {
		setters: [function (module) {
			small1 = module.s;
			small2 = module.a;
		}, function (module) {
			small3 = module.s;
		}],
		execute: (function () {

			console.log(small1, small2, small3);

		})
	};
}));
