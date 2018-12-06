System.register(['./generated-chunk2.js', './generated-chunk.js', 'external'], function (exports, module) {
	'use strict';
	var lib, reexported;
	return {
		setters: [function (module) {
			lib = module.a;
		}, function (module) {
			reexported = module.a;
		}, function () {}],
		execute: function () {

			console.log(lib);

		}
	};
});
