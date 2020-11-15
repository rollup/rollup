System.register('outputName', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			const something = exports('something', 42);

		}
	};
});
