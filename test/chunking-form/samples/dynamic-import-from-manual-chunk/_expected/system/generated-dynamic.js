System.register(['./main.js', './generated-manual.js'], (function () {
	'use strict';
	var dep1, dep2;
	return {
		setters: [function (module) {
			dep1 = module.d;
		}, function (module) {
			dep2 = module.d;
		}],
		execute: (function () {

			console.log(dep1, dep2);

		})
	};
}));
