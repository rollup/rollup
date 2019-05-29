System.register(['./generated-chunk.js'], function (exports) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.x;
			y = module.y;
		}],
		execute: function () {

			var main1 = exports('default', x + y);

		}
	};
});
