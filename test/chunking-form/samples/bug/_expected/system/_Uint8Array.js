System.register(['./_root.js'], function (exports, module) {
	'use strict';
	var root;
	return {
		setters: [function (module) {
			root = module.default;
		}],
		execute: function () {

			/** Built-in value references. */
			var Uint8Array = root.Uint8Array;
			exports('default', Uint8Array);

		}
	};
});
