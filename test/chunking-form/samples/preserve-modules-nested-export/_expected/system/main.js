System.register(['./inner/more_inner/something.js', './inner/some_effect.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("Something", module.Something);
		}, null],
		execute: (function () {



		})
	};
}));
