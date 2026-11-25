System.register(['./generated-preload.js'], (function () {
	'use strict';
	var preload;
	return {
		setters: [function (module) {
			preload = module.p;
		}],
		execute: (function () {

			console.log(preload(() => 'App'));

		})
	};
}));
