System.register(['./generated-manual.js', './generated-b.js'], (function (exports, module) {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.a;
		}, null],
		execute: (function () {

			module.import('./generated-tla.js').then(n => console.log(n.b, a));

		})
	};
}));
