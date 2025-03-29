System.register(['./main1.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports({ main2: module.m, shared: module.shared });
		}],
		execute: (function () {



		})
	};
}));
