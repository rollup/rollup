System.register(['./generated-manual.js', './generated-dep2.js'], (function () {
	'use strict';
	var manual;
	return {
		setters: [function (module) {
			manual = module.m;
		}, null],
		execute: (function () {

			console.log('main1', manual);

		})
	};
}));
