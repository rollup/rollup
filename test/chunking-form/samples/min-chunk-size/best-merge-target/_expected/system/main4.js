System.register(['./generated-small2.js', './generated-small4.js'], (function () {
	'use strict';
	var small2, small3, small4;
	return {
		setters: [function (module) {
			small2 = module.a;
		}, function (module) {
			small3 = module.s;
			small4 = module.a;
		}],
		execute: (function () {

			console.log(small2, small3, small4);

		})
	};
}));
