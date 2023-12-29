System.register('bundle', ['external'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("default", module.default);
		}],
		execute: (function () {

			const value = exports("value", 42);

		})
	};
}));
