System.register(['./generated-ac.js', './generated-b.js'], (function () {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.a;
		}, null],
		execute: (function () {

			console.log(a);

		})
	};
}));
