System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = function (v) { return exports({ foo: v, bar: v }); }(1);

		}
	};
});
