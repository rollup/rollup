System.register(['./hsl2hsv.js', './index-8b381a8d.js'], function (exports, module) {
	'use strict';
	var p, hsl2hsv, lib;
	return {
		setters: [function (module) {
			p = module.p;
		}, function (module) {
			hsl2hsv = module.a;
			lib = module.b;
		}],
		execute: function () {

			console.log(p);
			var main = exports('default', new Map(Object.entries(lib)));

		}
	};
});
