System.register(['./main1-alias.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("name", module.name);
		}],
		execute: (function () {



		})
	};
}));
