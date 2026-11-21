System.register(['./generated-b.js', './main.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null, null],
		execute: (function () {

			console.log('a');

			module.import('./generated-tla.js');

		})
	};
}));
