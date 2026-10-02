System.register(['./generated-a.js', './generated-x.js', './generated-b.js'], (function () {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.a;
		}, null, null],
		execute: (function () {

			console.log('main', a);

		})
	};
}));
