System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			class a {} exports({ a: a, b: a });

		}
	};
});
