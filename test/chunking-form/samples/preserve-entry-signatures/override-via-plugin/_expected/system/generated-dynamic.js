System.register(['./generated-allow-extension.js'], (function () {
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
