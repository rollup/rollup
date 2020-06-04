System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = function (v) {exports({foo: foo, bar: foo}); return v;} ( 1);

		}
	};
});
