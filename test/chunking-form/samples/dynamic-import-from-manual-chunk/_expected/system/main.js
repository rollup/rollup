System.register(['./generated-dep1.js', './generated-manual.js'], (function () {
	'use strict';
	var dep1;
	return {
		setters: [function (module) {
			dep1 = module.d;
		}, null],
		execute: (function () {

			console.log(dep1);

		})
	};
}));
