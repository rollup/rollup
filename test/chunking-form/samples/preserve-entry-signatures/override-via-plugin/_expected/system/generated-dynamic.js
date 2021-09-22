System.register(['./generated-main.js'], (function () {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (function () {

			console.log(shared);

		})
	};
}));
