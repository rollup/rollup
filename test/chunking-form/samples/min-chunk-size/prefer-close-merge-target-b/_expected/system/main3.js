System.register(['./generated-chunk2.js', './generated-chunk1.js'], (function () {
	'use strict';
	var big2, big1;
	return {
		setters: [function (module) {
			big2 = module.b;
		}, function (module) {
			big1 = module.b;
		}],
		execute: (function () {

			console.log(big1, big2);

		})
	};
}));
