System.register(['./generated-dep1.js', './generated-dep3.js'], function (exports) {
	'use strict';
	var x, y;
	return {
		setters: [function (module) {
			x = module.x;
		}, function (module) {
			y = module.y;
		}],
		execute: function () {

			var main1 = exports('default', x + y);

		}
	};
});
