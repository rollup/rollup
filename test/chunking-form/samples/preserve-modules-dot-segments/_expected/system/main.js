System.register(['./util.js'], (function () {
	'use strict';
	var util;
	return {
		setters: [function (module) {
			util = module.util;
		}],
		execute: (function () {

			console.log(util);

		})
	};
}));
