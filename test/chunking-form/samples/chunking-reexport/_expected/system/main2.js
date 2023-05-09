System.register(['./main1.js', 'external'], (function (exports) {
	'use strict';
	return {
		setters: [null, function (module) {
			exports('dep', module.asdf);
		}],
		execute: (function () {



		})
	};
}));
