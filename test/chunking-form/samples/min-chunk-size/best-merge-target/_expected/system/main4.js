System.register(['./generated-small4.js', './generated-small3.js'], (function () {
	'use strict';
	var small2, small4, small3;
	return {
		setters: [function (module) {
			small2 = module.s;
			small4 = module.a;
		}, function (module) {
			small3 = module.a;
		}],
		execute: (function () {

			console.log(small2, small3, small4);

		})
	};
}));
