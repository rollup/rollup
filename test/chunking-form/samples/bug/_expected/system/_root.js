System.register(['./_freeGlobal.js'], function (exports, module) {
	'use strict';
	var freeGlobal;
	return {
		setters: [function (module) {
			freeGlobal = module.default;
		}],
		execute: function () {

			/** Detect free variable `self`. */
			var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

			/** Used as a reference to the global object. */
			var root = freeGlobal || freeSelf || Function('return this')();
			exports('default', root);

		}
	};
});
