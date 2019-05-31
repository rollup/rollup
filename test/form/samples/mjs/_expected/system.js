System.register('myBundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			var dep = exports('depJs', 'js');

			var dep$1 = exports('depMjs', 'mjs');

		}
	};
});
