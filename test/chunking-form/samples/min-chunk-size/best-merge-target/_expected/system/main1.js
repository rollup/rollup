System.register(['./generated-small3.js'], (function () {
	'use strict';
	var small1, small3;
	return {
		setters: [function (module) {
			small1 = module.s;
			small3 = module.a;
		}],
		execute: (function () {

			console.log(small1, small3);

		})
	};
}));
