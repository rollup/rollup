System.register(['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('bar', module.bar);
		}],
		execute: (function () {

			console.log('other');

			console.log('main');

		})
	};
}));
