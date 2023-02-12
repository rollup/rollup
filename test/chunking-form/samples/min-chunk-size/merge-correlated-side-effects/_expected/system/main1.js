System.register(['./generated-small1.js', './generated-small2.js'], (function () {
	'use strict';
	var small1, small2;
	return {
		setters: [function (module) {
			small1 = module.s;
		}, function (module) {
			small2 = module.s;
		}],
		execute: (function () {

			console.log(small1, small2);

		})
	};
}));
