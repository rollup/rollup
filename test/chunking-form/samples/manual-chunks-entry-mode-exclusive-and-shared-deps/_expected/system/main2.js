System.register(['./generated-manual.js', './generated-shared.js'], (function () {
	'use strict';
	var m;
	return {
		setters: [function (module) {
			m = module.m;
		}, null],
		execute: (function () {

			console.log('main2', m);

		})
	};
}));
