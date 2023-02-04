System.register(['./generated-dep11.js', './generated-dep112.js', './generated-dep111.js'], (function () {
	'use strict';
	var x;
	return {
		setters: [null, function (module) {
			x = module.x;
		}, null],
		execute: (function () {

			console.log('1');

			console.log(x);

		})
	};
}));
