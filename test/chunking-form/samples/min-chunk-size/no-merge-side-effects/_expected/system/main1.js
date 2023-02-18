System.register(['./generated-big.js', './generated-small.js'], (function () {
	'use strict';
	var big, small;
	return {
		setters: [function (module) {
			big = module.b;
		}, function (module) {
			small = module.s;
		}],
		execute: (function () {

			console.log(big, small);

		})
	};
}));
