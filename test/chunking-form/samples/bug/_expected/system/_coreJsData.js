System.register(['./_root.js'], function (exports, module) {
	'use strict';
	var root;
	return {
		setters: [function (module) {
			root = module.default;
		}],
		execute: function () {

			/** Used to detect overreaching core-js shims. */
			var coreJsData = root['__core-js_shared__'];
			exports('default', coreJsData);

		}
	};
});
