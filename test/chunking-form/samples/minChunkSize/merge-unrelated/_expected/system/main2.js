System.register(['./generated-small2.js'], (function () {
	'use strict';
	var small1;
	return {
		setters: [function (module) {
			small1 = module.s;
		}],
		execute: (function () {

			console.log(small1);

		})
	};
}));
