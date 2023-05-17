System.register(['./main1.js'], (function () {
	'use strict';
	var name;
	return {
		setters: [function (module) {
			name = module.name;
		}],
		execute: (function () {

			console.log(name);

		})
	};
}));
