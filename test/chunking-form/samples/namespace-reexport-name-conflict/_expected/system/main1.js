System.register(['./generated-index.js', './generated-dep.js', 'external'], function () {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
		}, function () {}, function () {}],
		execute: function () {

			console.log(lib);

		}
	};
});
