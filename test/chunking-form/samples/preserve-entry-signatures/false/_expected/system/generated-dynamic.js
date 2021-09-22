System.register(['./main.js'], (function () {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (function () {

			globalThis.sharedDynamic = shared;

		})
	};
}));
