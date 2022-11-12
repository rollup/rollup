System.register(['./generated-small.js'], (function () {
	'use strict';
	var big, small;
	return {
		setters: [function (module) {
			big = module.b;
			small = module.s;
		}],
		execute: (function () {

			console.log(big, small);

		})
	};
}));
