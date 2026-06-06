System.register(['./generated-manual.js', './generated-dep2.js'], (function () {
	'use strict';
	var manual;
	return {
		setters: [function (module) {
			manual = module.a;
		}, null],
		execute: (function () {

			console.log('main2', manual);

		})
	};
}));
