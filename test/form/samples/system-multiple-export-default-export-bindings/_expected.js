System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			class A {} exports({ A: A, default: A });

		}
	};
});
