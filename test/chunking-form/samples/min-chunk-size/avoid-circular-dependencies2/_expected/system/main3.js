System.register(['./main1.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ main3: module.a, second: module.second });
		}],
		execute: (function () {



		})
	};
}));
