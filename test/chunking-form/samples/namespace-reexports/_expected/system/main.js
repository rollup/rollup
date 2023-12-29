System.register(['./generated-index.js', './hsl2hsv.js'], (function (exports) {
	'use strict';
	var lib, p;
	return {
		setters: [function (module) {
			lib = module.l;
		}, function (module) {
			p = module.p;
		}],
		execute: (function () {

			console.log(p);
			var main = exports("default", new Map(Object.entries(lib)));

		})
	};
}));
