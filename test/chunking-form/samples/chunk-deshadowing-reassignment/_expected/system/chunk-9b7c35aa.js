System.register(['./chunk-2ec47290.js', './chunk-a5be984a.js'], function (exports, module) {
	'use strict';
	var x, x$1;
	return {
		setters: [function (module) {
			x = module.a;
		}, function (module) {
			x$1 = module.a;
		}],
		execute: function () {

			var x$2 = exports('a', x + 1);

			var y = exports('b', x$1 + 1);

		}
	};
});
