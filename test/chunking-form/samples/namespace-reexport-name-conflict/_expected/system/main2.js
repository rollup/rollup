System.register(['./generated-chunk.js', 'external', './generated-chunk2.js'], function (exports, module) {
	'use strict';
	var reexported;
	return {
		setters: [function (module) {
			reexported = module.a;
		}, function () {}, function () {}],
		execute: function () {

			console.log(reexported);

		}
	};
});
