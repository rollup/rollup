System.register(['./hsl2hsv.js', './index-51f0f10d.js'], function (exports, module) {
	'use strict';
	var p, lib;
	return {
		setters: [function (module) {
			p = module.p;
		}, function (module) {
			lib = module.a;
		}],
		execute: function () {

			console.log(p);
			var main = exports('default', new Map(Object.entries(lib)));

		}
	};
});
