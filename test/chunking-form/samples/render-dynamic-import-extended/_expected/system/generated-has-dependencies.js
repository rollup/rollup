System.register(['./generated-no-dependencies.js'], (function (exports) {
	'use strict';
	var fortyTwo;
	return {
		setters: [function (module) {
			fortyTwo = module.default;
			exports("default", module.default);
		}],
		execute: (function () {

			console.log('from import:', fortyTwo);

		})
	};
}));
