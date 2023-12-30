System.register(['./generated-shared.js'], (function (exports) {
	'use strict';
	var shared;
	return {
		setters: [function (module) {
			shared = module.s;
		}],
		execute: (function () {

			var main2 = exports("default", shared.map(d => d + 2));

		})
	};
}));
