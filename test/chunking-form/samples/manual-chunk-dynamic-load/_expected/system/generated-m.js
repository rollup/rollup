System.register(['./main.js'], (function (exports) {
	'use strict';
	var DEP;
	return {
		setters: [function (module) {
			DEP = module.D;
		}],
		execute: (function () {

			const M = exports("M", DEP + 'M');

		})
	};
}));
