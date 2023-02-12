System.register(['./generated-other-effect.js', './generated-small2.js'], (function () {
	'use strict';
	var small2;
	return {
		setters: [null, function (module) {
			small2 = module.a;
		}],
		execute: (function () {

			console.log(small2);

		})
	};
}));
