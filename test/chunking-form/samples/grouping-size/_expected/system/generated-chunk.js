System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const x = exports('x', 1);
			console.log('too large for grouping');

		}
	};
});
