System.register(['./generated-chunk.js'], (function () {
	'use strict';
	var big;
	return {
		setters: [function (module) {
			big = module.b;
		}],
		execute: (function () {

			console.log(big);

		})
	};
}));
