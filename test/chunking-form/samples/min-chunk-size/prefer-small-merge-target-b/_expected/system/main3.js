System.register(['./generated-chunk1.js'], (function () {
	'use strict';
	var huge;
	return {
		setters: [function (module) {
			huge = module.h;
		}],
		execute: (function () {

			console.log(huge);

		})
	};
}));
