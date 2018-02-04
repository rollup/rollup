System.register(['./_WeakMap.js'], function (exports, module) {
	'use strict';
	var WeakMap;
	return {
		setters: [function (module) {
			WeakMap = module.default;
		}],
		execute: function () {

			/** Used to store function metadata. */
			var metaMap = WeakMap && new WeakMap;
			exports('default', metaMap);

		}
	};
});
