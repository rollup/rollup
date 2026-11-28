System.register(['./generated-loader.js'], (function () {
	'use strict';
	var preload, load;
	return {
		setters: [function (module) {
			preload = module.p;
			load = module.l;
		}],
		execute: (function () {

			console.log(
				preload(() => 'entry'),
				typeof load
			);

		})
	};
}));
