System.register(['./hsl2hsv.js', './generated-index.js'], function (exports) {
	'use strict';
	var p, lib;
	return {
		setters: [function (module) {
			p = module.p;
		}, function (module) {
			lib = module.l;
		}],
		execute: function () {

			console.log(p);
			var main = exports('default', new Map(Object.entries(lib)));

		}
	};
});
