System.register(['./generated-chunk.js', 'external', './generated-chunk2.js'], function (exports, module) {
	'use strict';
	var lib;
	return {
		setters: [function () {}, function () {}, function (module) {
			lib = module.l;
		}],
		execute: function () {

			console.log(lib);

		}
	};
});
