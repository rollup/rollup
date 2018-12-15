System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.a;
			y = module.b;
		}],
		execute: function () {

			var main1 = exports('default', x + y);

		}
	};
});
