System.register(['./generated-manual.js', './generated-shared.js', './generated-exclusive.js'], (function () {
	'use strict';
	var m;
	return {
		setters: [function (module) {
			m = module.m;
		}, null, null],
		execute: (function () {

			console.log('main2', m);

		})
	};
}));
