System.register(['./generated-small2.js'], (function () {
	'use strict';
	var small1, small2;
	return {
		setters: [function (module) {
			small1 = module.s;
			small2 = module.a;
		}],
		execute: (function () {

			console.log(small1, small2);

		})
	};
}));
