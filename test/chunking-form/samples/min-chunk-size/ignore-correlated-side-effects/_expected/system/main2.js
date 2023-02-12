System.register(['./generated-effect.js', './generated-small2.js'], (function () {
	'use strict';
	var small1;
	return {
		setters: [null, function (module) {
			small1 = module.s;
		}],
		execute: (function () {

			console.log(small1);

		})
	};
}));
