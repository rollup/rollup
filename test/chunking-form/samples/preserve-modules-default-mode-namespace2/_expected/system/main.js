System.register(['./lib.js'], (function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module;
		}],
		execute: (function () {

			console.log(lib);

		})
	};
}));
