System.register(['./index-8b381a8d.js', './hsl2hsv.js'], function (exports, module) {
	'use strict';
	var hsl2hsv, lib, p;
	return {
		setters: [function (module) {
			hsl2hsv = module.a;
			lib = module.b;
		}, function (module) {
			p = module.p;
		}],
		execute: function () {

			console.log(p);
			var main = exports('default', new Map(Object.entries(lib)));

		}
	};
});
