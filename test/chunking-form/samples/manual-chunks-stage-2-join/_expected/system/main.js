System.register(['./generated-manual.js'], (function (exports, module) {
	'use strict';
	var m;
	return {
		setters: [function (module) {
			m = module.m;
		}],
		execute: (function () {

			module.import('./generated-manual.js').then(function (n) { return n.x; }).then(n => console.log(n.x, m));

		})
	};
}));
