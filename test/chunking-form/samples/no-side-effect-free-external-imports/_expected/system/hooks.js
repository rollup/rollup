System.register(['lib-hooks-a', 'lib-hooks-b'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("hooksA", module.hooksA);
		}, function (module) {
			exports("hooksB", module.hooksB);
		}],
		execute: (function () {



		})
	};
}));
