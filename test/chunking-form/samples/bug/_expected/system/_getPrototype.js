System.register(['./_overArg.js'], function (exports, module) {
	'use strict';
	var overArg;
	return {
		setters: [function (module) {
			overArg = module.default;
		}],
		execute: function () {

			/** Built-in value references. */
			var getPrototype = overArg(Object.getPrototypeOf, Object);
			exports('default', getPrototype);

		}
	};
});
