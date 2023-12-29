System.register('myBundle', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("s", module.p);
		}],
		execute: (function () {



		})
	};
}));
