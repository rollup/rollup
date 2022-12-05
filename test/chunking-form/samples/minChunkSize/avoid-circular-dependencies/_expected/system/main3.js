System.register(['./generated-small.js'], (function () {
	'use strict';
	var small;
	return {
		setters: [function (module) {
			small = module.s;
		}],
		execute: (function () {

			console.log(small);

		})
	};
}));
