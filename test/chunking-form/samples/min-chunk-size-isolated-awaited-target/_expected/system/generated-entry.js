System.register(['./generated-cycle.js', './generated-preload.js', './generated-entry.js'], (function () {
	'use strict';
	var preload;
	return {
		setters: [null, function (module) {
			preload = module.p;
		}, null],
		execute: (function () {

			console.log(preload(() => 'App'));

		})
	};
}));
