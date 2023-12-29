System.register(['./main1.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("small", module.small);
		}],
		execute: (function () {



		})
	};
}));
