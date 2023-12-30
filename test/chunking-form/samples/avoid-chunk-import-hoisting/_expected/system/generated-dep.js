System.register(['lib'], (function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.default;
		}],
		execute: (function () {

			var dep = exports("d", 2 * value);

		})
	};
}));
