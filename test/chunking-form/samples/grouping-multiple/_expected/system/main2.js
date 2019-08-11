System.register(['./generated-dep3.js'], function (exports) {
	'use strict';
	var x, z;
	return {
		setters: [function (module) {
			x = module.x;
			z = module.z;
		}],
		execute: function () {

			var main2 = exports('default', x + z);

		}
	};
});
