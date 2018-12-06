System.register(['./generated-chunk2.js', './generated-chunk.js', 'external'], function (exports, module) {
	'use strict';
	var reexported;
	return {
		setters: [function () {}, function (module) {
			reexported = module.a;
		}, function () {}],
		execute: function () {

			console.log(reexported);

		}
	};
});
