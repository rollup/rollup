System.register(['./generated-manual.js'], (function (exports, module) {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.a;
		}],
		execute: (function () {

			module.import('./generated-manual.js').then(function (n) { return n.m; }).then(n => console.log(n.b, a));

		})
	};
}));
