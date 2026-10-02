System.register(['./generated-manual.js', './generated-x.js'], (function (exports, module) {
	'use strict';
	var m;
	return {
		setters: [function (module) {
			m = module.m;
		}, null],
		execute: (function () {

			module.import('./generated-x.js').then(n => console.log(n.x, m));

		})
	};
}));
