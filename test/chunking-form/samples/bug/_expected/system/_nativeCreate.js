System.register(['./_getNative.js'], function (exports, module) {
	'use strict';
	var getNative;
	return {
		setters: [function (module) {
			getNative = module.default;
		}],
		execute: function () {

			/* Built-in method references that are verified to be native. */
			var nativeCreate = getNative(Object, 'create');
			exports('default', nativeCreate);

		}
	};
});
