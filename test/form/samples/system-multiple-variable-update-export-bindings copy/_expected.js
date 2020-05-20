System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			let a = 123; exports({ a: a, b: a });
			a++, exports({ a: a, b: a });

		}
	};
});
