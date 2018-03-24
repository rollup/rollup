System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const data = [1, 2, 3];
			exports('d', data);

		}
	};
});
