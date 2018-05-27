System.register('myBundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var dep = exports('depJs', 'js');

			var dep$1 = exports('depMjs', 'mjs');

		}
	};
});
