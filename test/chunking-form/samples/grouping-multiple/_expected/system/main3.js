System.register(['./generated-dep3.js'], function (exports) {
	'use strict';
	var y, z;
	return {
		setters: [function (module) {
			y = module.y;
			z = module.z;
		}],
		execute: function () {

			var main3 = exports('default', y + z);

		}
	};
});
