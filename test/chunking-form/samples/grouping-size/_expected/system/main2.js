System.register(['./generated-chunk.js', './generated-chunk2.js'], function (exports) {
	'use strict';
	var x, z;
	return {
		setters: [function (module) {
			x = module.x;
		}, function (module) {
			z = module.z;
		}],
		execute: function () {

			var main2 = exports('default', x + z);

		}
	};
});
