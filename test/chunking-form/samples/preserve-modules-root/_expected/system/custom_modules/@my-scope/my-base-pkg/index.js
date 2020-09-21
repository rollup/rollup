System.register(['../../../_virtual/_commonjsHelpers.js'], function (exports) {
	'use strict';
	var createCommonjsModule;
	return {
		setters: [function (module) {
			createCommonjsModule = module.createCommonjsModule;
		}],
		execute: function () {

			var myBasePkg = exports('m', createCommonjsModule(function (module, exports) {

			Object.defineProperty(exports, '__esModule', { value: true });

			var hello = 'world';

			exports.hello = hello;
			}));

		}
	};
});
