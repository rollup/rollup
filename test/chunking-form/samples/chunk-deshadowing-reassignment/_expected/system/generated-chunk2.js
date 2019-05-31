System.register(['./generated-chunk.js', './generated-chunk3.js'], function (exports) {
	'use strict';
	var x$1, x$2;
	return {
		setters: [function (module) {
			x$1 = module.x;
		}, function (module) {
			x$2 = module.x;
		}],
		execute: function () {

			var x = exports('x', x$1 + 1);

			var y = exports('y', x$2 + 1);

		}
	};
});
