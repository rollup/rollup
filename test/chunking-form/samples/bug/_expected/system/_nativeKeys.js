System.register(['./_overArg.js'], function (exports, module) {
	'use strict';
	var overArg;
	return {
		setters: [function (module) {
			overArg = module.default;
		}],
		execute: function () {

			/* Built-in method references for those with the same name as other `lodash` methods. */
			var nativeKeys = overArg(Object.keys, Object);
			exports('default', nativeKeys);

		}
	};
});
