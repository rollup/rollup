System.register(['./_getNative.js', './_root.js'], function (exports, module) {
	'use strict';
	var getNative, root;
	return {
		setters: [function (module) {
			getNative = module.default;
		}, function (module) {
			root = module.default;
		}],
		execute: function () {

			/* Built-in method references that are verified to be native. */
			var Map = getNative(root, 'Map');
			exports('default', Map);

		}
	};
});
