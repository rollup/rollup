System.register(['./generated-index.js', './generated-dep.js', 'external'], (function () {
	'use strict';
	var reexported;
	return {
		setters: [null, function (module) {
			reexported = module.r;
		}, null],
		execute: (function () {

			console.log(reexported);

		})
	};
}));
