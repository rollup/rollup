System.register(['./generated-shared.js', './generated-exclusive.js'], (function (exports) {
	'use strict';
	var shared, exclusive;
	return {
		setters: [function (module) {
			shared = module.s;
		}, function (module) {
			exclusive = module.e;
		}],
		execute: (function () {

			const m = exports("m", shared + exclusive);

		})
	};
}));
