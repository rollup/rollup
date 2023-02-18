System.register(['./generated-chunk1.js', './generated-chunk2.js'], (function () {
	'use strict';
	var small, big, huge;
	return {
		setters: [function (module) {
			small = module.s;
			big = module.b;
		}, function (module) {
			huge = module.h;
		}],
		execute: (function () {

			console.log(small, big, huge);

		})
	};
}));
