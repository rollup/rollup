System.register(['./generated-shared.js'], (function () {
	'use strict';
	var shared, small;
	return {
		setters: [function (module) {
			shared = module.s;
			small = module.a;
		}],
		execute: (function () {

			console.log(shared, small);

		})
	};
}));
