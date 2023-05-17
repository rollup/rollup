System.register(['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('dep', module.asdf);
		}],
		execute: (function () {

			console.log('dep');

		})
	};
}));
