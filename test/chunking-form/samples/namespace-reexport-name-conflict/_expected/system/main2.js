System.register(['./generated-index.js', './generated-dep.js', 'external'], (function () {
	'use strict';
	var reexported;
	return {
		setters: [function () {}, function (module) {
			reexported = module.r;
		}, function () {}],
		execute: (function () {

			console.log(reexported);

		})
	};
}));
