System.register(['./generated-chunk.js', './generated-chunk3.js'], function (exports, module) {
	'use strict';
	var x$1, x$2;
	return {
		setters: [function (module) {
			x$1 = module.a;
		}, function (module) {
			x$2 = module.a;
		}],
		execute: function () {

			var x = exports('a', x$1 + 1);

			var y = exports('b', x$2 + 1);

		}
	};
});
