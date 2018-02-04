System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			/** Detect free variable `global` from Node.js. */
			var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
			exports('default', freeGlobal);

		}
	};
});
