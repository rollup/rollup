System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.value;
			exports("reexported", module.default);
		}],
		execute: (function () {

			console.log(value);

		})
	};
}));
