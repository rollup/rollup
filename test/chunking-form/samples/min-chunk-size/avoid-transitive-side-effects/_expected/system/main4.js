System.register(['./generated-small.js', './generated-chunk.js', './generated-effect.js'], (function () {
	'use strict';
	var small, big;
	return {
		setters: [function (module) {
			small = module.s;
		}, function (module) {
			big = module.b;
		}, null],
		execute: (function () {

			console.log(small, big);

		})
	};
}));
