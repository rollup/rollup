System.register(['./generated-index.js', './generated-dep.js', 'external'], (function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}, null, null],
		execute: (function () {

			console.log(lib);

		})
	};
}));
