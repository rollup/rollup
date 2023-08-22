System.register(['../first.js', '../../second.js'], (function () {
	'use strict';
	var first, second;
	return {
		setters: [function (module) {
			first = module.first;
		}, function (module) {
			second = module.second;
		}],
		execute: (function () {

			console.log(first, second);

		})
	};
}));
