System.register('bundle', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("value", module.default);
		}],
		execute: (function () {

			console.log('main');

		})
	};
}));
