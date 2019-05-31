System.register(['./generated-chunk.js', './generated-chunk2.js', './generated-chunk3.js'], function (exports, module) {
	'use strict';
	var x;
	return {
		setters: [function () {}, function (module) {
			x = module.x;
		}, function () {}],
		execute: function () {

			console.log('1');

			console.log(x);

		}
	};
});
