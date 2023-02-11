System.register(['./generated-chunk1.js', './generated-chunk2.js'], (function () {
	'use strict';
	var small, big1, big2;
	return {
		setters: [function (module) {
			small = module.s;
			big1 = module.b;
		}, function (module) {
			big2 = module.b;
		}],
		execute: (function () {

			console.log(small, big1, big2);

		})
	};
}));
