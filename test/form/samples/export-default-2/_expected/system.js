System.register('myBundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			var bar = 1;
			exports('default', bar);

		}
	};
});
