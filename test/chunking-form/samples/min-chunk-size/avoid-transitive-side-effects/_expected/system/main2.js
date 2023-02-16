System.register(['./generated-chunk.js', './generated-effect.js'], (function () {
	'use strict';
	var big;
	return {
		setters: [function (module) {
			big = module.b;
		}, null],
		execute: (function () {

			console.log(big);

		})
	};
}));
