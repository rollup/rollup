System.register(['./chunk-2ec47290.js', './chunk-a5be984a.js'], function (exports, module) {
	'use strict';
	var x, x$1;
	return {
		setters: [function (module) {
			x = module.x;
		}, function (module) {
			x$1 = module.x;
		}],
		execute: function () {

			var x$2 = exports('x', x + 1);

			var y = exports('y', x$1 + 1);

		}
	};
});
