System.register(['./generated-chunk.js', './generated-chunk2.js'], function (exports, module) {
	'use strict';
	var x, z;
	return {
		setters: [function (module) {
			x = module.a;
		}, function (module) {
			z = module.b;
		}],
		execute: function () {

			var main2 = exports('default', x + z);

		}
	};
});
